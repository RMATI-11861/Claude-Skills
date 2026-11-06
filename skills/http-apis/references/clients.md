# Client snippets

## Node 18+ (fetch)

```js
const RETRYABLE = new Set([429, 503]);
const IDEMPOTENT = new Set(['GET', 'HEAD', 'PUT', 'DELETE']);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const backoff = (attempt) => Math.min(30_000, 500 * 2 ** attempt) * (0.5 + Math.random() / 2);

export async function requestJson(url, { attempts = 4, timeoutMs = 10_000, ...init } = {}) {
  const method = (init.method ?? 'GET').toUpperCase();
  const retryable = IDEMPOTENT.has(method) || Boolean(init.headers?.['Idempotency-Key']);
  for (let attempt = 1; ; attempt += 1) {
    let response;
    try {
      response = await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
    } catch (error) {
      if (!retryable || attempt >= attempts) throw error;
      await sleep(backoff(attempt));
      continue;
    }
    if (response.ok) return response.status === 204 ? null : response.json();
    if (!retryable || !RETRYABLE.has(response.status) || attempt >= attempts) {
      const isProblem = response.headers.get('content-type')?.includes('application/problem+json');
      const problem = isProblem ? await response.json() : null;
      throw new Error(`${method} ${url} failed: ${response.status} ${problem?.detail ?? response.statusText}`);
    }
    const retryAfter = Number(response.headers.get('retry-after'));
    await sleep(retryAfter > 0 ? retryAfter * 1000 : backoff(attempt));
  }
}
```

## Windows PowerShell 5.1

```powershell
function Invoke-JsonWithRetry {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Uri,
        [ValidateSet('GET', 'HEAD', 'PUT', 'DELETE', 'POST', 'PATCH')][string]$Method = 'GET',
        [object]$Body,
        [int]$Attempts = 4,
        [int]$TimeoutSec = 10
    )
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    $idempotent = $Method -in 'GET', 'HEAD', 'PUT', 'DELETE'
    $request = @{ Uri = $Uri; Method = $Method; TimeoutSec = $TimeoutSec }
    if ($null -ne $Body) {
        # 5.1 sends string bodies as ISO-8859-1; send UTF-8 bytes instead.
        $request.Body = [Text.Encoding]::UTF8.GetBytes(($Body | ConvertTo-Json -Depth 10))
        $request.ContentType = 'application/json; charset=utf-8'
    }
    for ($attempt = 1; ; $attempt++) {
        try {
            return Invoke-RestMethod @request
        } catch {
            $response = $_.Exception.Response
            $status = if ($response) { [int]$response.StatusCode } else { 0 }
            $retryable = $idempotent -and ($status -eq 0 -or $status -eq 429 -or $status -eq 503)
            if (-not $retryable -or $attempt -ge $Attempts) { throw }
            $retryAfter = 0
            $hasRetryAfter = $response -and [int]::TryParse([string]$response.Headers['Retry-After'], [ref]$retryAfter)
            $delayMs = if ($hasRetryAfter -and $retryAfter -gt 0) { $retryAfter * 1000 } else { [Math]::Min(30000, 500 * [Math]::Pow(2, $attempt)) }
            Start-Sleep -Milliseconds $delayMs
        }
    }
}
```

## problem+json body

```json
{
  "type": "https://example.com/problems/validation",
  "title": "Invalid request",
  "status": 422,
  "detail": "quantity must be a positive integer",
  "instance": "/orders/123",
  "errors": [{ "pointer": "/items/0/quantity", "detail": "must be greater than 0" }]
}
```
