[CmdletBinding()]
param(
    [string]$DataDir = (Join-Path $PSScriptRoot 'data'),
    [int]$Port = 4318,
    [string]$NodePath = ''
)

# Windows PowerShell 5.1; somente processos criados por esta chamada.
Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'
if ($Port -lt 0 -or $Port -gt 65535) { throw 'Porta invalida: use 0 a 65535.' }
if ([string]::IsNullOrWhiteSpace($NodePath)) {
    $NodePath = $env:CRM_NODE_PATH
    if ([string]::IsNullOrWhiteSpace($NodePath)) {
        $crmNodeCommand = Get-Command node.exe -CommandType Application -ErrorAction SilentlyContinue
        if ($crmNodeCommand) { $NodePath = $crmNodeCommand.Source }
    }
}
if ([string]::IsNullOrWhiteSpace($NodePath) -or !(Test-Path -LiteralPath $NodePath -PathType Leaf)) {
    throw 'Node ausente: selecione o runtime existente com -NodePath ou CRM_NODE_PATH.'
}
$crmRuntime = (Resolve-Path -LiteralPath $NodePath).ProviderPath
if ([string]::IsNullOrWhiteSpace($DataDir)) { throw 'DataDir precisa ser um diretorio local.' }
if (![System.IO.Path]::IsPathRooted($DataDir)) { $DataDir = Join-Path (Get-Location).ProviderPath $DataDir }
$crmDataPath = [System.IO.Path]::GetFullPath($DataDir)

# Reserva de verificacao: solta somente este listener, nunca o ocupante.
if ($Port -ne 0) {
    $crmProbe = New-Object System.Net.Sockets.TcpListener ([System.Net.IPAddress]::Loopback), $Port
    try { $crmProbe.Start() }
    catch { throw ('Porta ' + $Port + ' ocupada ou indisponivel. Confira a instancia existente ou escolha outra porta com -Port.') }
    finally { $crmProbe.Stop() }
}

$crmLogDir = Join-Path $crmDataPath ('runtime\iniciador-' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $crmLogDir -Force | Out-Null
$crmOutput = Join-Path $crmLogDir 'stdout.log'
$crmError = Join-Path $crmLogDir 'stderr.log'
$crmEntry = Join-Path $PSScriptRoot 'src\servidor.cjs'
# ArgumentList e uma string; aspas preservam caminhos com espacos (PS 5.1).
# O sufixo \. evita barra final imediatamente antes da aspa de fechamento.
$crmArguments = '"' + $crmEntry + '" --data-dir "' + (Join-Path $crmDataPath '.') + '" --port ' + $Port
$crmProcess = $null
try {
    $crmProcess = Start-Process -FilePath $crmRuntime -ArgumentList $crmArguments -WorkingDirectory $PSScriptRoot `
        -WindowStyle Hidden -PassThru -RedirectStandardOutput $crmOutput -RedirectStandardError $crmError
    $crmDeadline = [DateTime]::UtcNow.AddSeconds(10)
    while ([DateTime]::UtcNow -lt $crmDeadline) {
        $crmProcess.Refresh()
        if ($crmProcess.HasExited) { throw 'Falha ao iniciar o CRM local; confira -NodePath, o mapa do quadro e a porta.' }
        $crmOutputStream = [System.IO.File]::Open($crmOutput, [System.IO.FileMode]::Open,
            [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
        $crmReader = New-Object System.IO.StreamReader $crmOutputStream
        try { $crmStarted = $crmReader.ReadToEnd() }
        finally { $crmReader.Dispose() }
        if ($crmStarted -match '(?m)^CRM local: (http://127\.0\.0\.1:\d+)\s*$') {
            return [pscustomobject]@{
                processId = $crmProcess.Id
                url = $Matches[1]
                logDir = $crmLogDir
                encerrar = ('Stop-Process -Id ' + $crmProcess.Id)
            }
        }
        Start-Sleep -Milliseconds 100
    }
    throw 'O CRM nao confirmou inicio em 10 segundos; confira -NodePath, o mapa do quadro e a porta.'
}
catch {
    # Erro ou corrida na porta: encerra apenas o filho desta chamada, se vivo.
    if ($crmProcess) {
        $crmProcess.Refresh()
        if (!$crmProcess.HasExited) { Stop-Process -InputObject $crmProcess -ErrorAction SilentlyContinue }
    }
    throw
}
