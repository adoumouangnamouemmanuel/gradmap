$ErrorActionPreference = 'Stop'
$taskWorkspace = Split-Path -Parent $PSScriptRoot
$taskDbDir = Join-Path ([System.IO.Path]::GetTempPath()) ('gradmap-db-qa-' + [guid]::NewGuid().ToString('N'))
$taskListener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 0)
$taskListener.Start()
$taskPort = $taskListener.LocalEndpoint.Port
$taskListener.Stop()
$taskPostgres = (Get-Command postgres -ErrorAction Stop).Source
$taskInitDb = (Get-Command initdb -ErrorAction Stop).Source
$taskPgCtl = (Get-Command pg_ctl -ErrorAction Stop).Source
$taskPsql = (Get-Command psql -ErrorAction Stop).Source
& $taskInitDb -D $taskDbDir -U postgres --auth=trust --encoding=UTF8 --no-locale | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Unable to initialize disposable PostgreSQL.' }
$taskProcess = Start-Process -FilePath $taskPostgres -ArgumentList @('-D', ('"' + $taskDbDir + '"'), '-h', '127.0.0.1', '-p', $taskPort) -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $taskDbDir 'server.log') -RedirectStandardError (Join-Path $taskDbDir 'server-error.log')
try {
  $taskReady = $false
  for ($taskAttempt = 0; $taskAttempt -lt 40; $taskAttempt++) {
    & $taskPsql -h 127.0.0.1 -p $taskPort -U postgres -d postgres -w -c 'select 1' 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) { $taskReady = $true; break }
    Start-Sleep -Milliseconds 250
  }
  if (!$taskReady) { throw 'Disposable PostgreSQL did not become ready.' }
  $taskFiles = @((Join-Path $taskWorkspace 'supabase/tests/native_bootstrap.sql')) + @(Get-ChildItem -LiteralPath (Join-Path $taskWorkspace 'supabase/migrations') -Filter '*.sql' | Sort-Object Name | ForEach-Object { $_.FullName }) + @((Join-Path $taskWorkspace 'supabase/tests/workspace_integrity.sql'))
  foreach ($taskFile in $taskFiles) {
    & $taskPsql -h 127.0.0.1 -p $taskPort -U postgres -d postgres -w -q -v ON_ERROR_STOP=1 -f $taskFile
    if ($LASTEXITCODE -ne 0) { throw ('Database check failed: ' + (Split-Path -Leaf $taskFile)) }
  }
  & $taskPsql -h 127.0.0.1 -p $taskPort -U postgres -d postgres -w -q -v ON_ERROR_STOP=1 -f (Join-Path $taskWorkspace 'supabase/tests/version_concurrency_seed.sql')
  if ($LASTEXITCODE -ne 0) { throw 'Unable to seed version concurrency fixture.' }
  $taskRevisionProcesses = @()
  foreach ($taskRevision in @('A','B')) {
    $taskRevisionFile = Join-Path $taskDbDir ('revision-' + $taskRevision + '.sql')
    Set-Content -LiteralPath $taskRevisionFile -Value ("set role authenticated; select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000003',false); select public.create_essay_revision('50000000-0000-4000-8000-000000000003','Concurrent draft " + $taskRevision + "',null);")
    $taskRevisionProcesses += Start-Process -FilePath $taskPsql -ArgumentList @('-h','127.0.0.1','-p',$taskPort,'-U','postgres','-d','postgres','-w','-q','-v','ON_ERROR_STOP=1','-f',('"' + $taskRevisionFile + '"')) -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $taskDbDir ($taskRevision + '-out.log')) -RedirectStandardError (Join-Path $taskDbDir ($taskRevision + '-error.log'))
  }
  foreach ($taskRevisionProcess in $taskRevisionProcesses) {
    if (!$taskRevisionProcess.WaitForExit(10000) -or $taskRevisionProcess.ExitCode -ne 0) { throw 'Concurrent revision save failed.' }
  }
  & $taskPsql -h 127.0.0.1 -p $taskPort -U postgres -d postgres -w -q -v ON_ERROR_STOP=1 -f (Join-Path $taskWorkspace 'supabase/tests/version_concurrency_assert.sql')
  if ($LASTEXITCODE -ne 0) { throw 'Concurrent revision assertions failed.' }
} finally {
  & $taskPgCtl -D $taskDbDir -m fast -w stop | Out-Null
  Write-Output ('Disposable database stopped. Diagnostic files: ' + $taskDbDir)
}
