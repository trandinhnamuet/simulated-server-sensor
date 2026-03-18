#!/usr/bin/env pwsh

Write-Host "=== Testing Sensor Cache Logic ===" -ForegroundColor Cyan

Write-Host "`nTest 1: Initial call" -ForegroundColor Green
$call1 = irm http://localhost:2998/sensors/temperature
Write-Host "Value: $($call1.value)`u00B0C | Time: $($call1.timestamp)"

Write-Host "`nTest 2: Call after 300ms (< 2s threshold)" -ForegroundColor Yellow
Start-Sleep -Milliseconds 300
$call2 = irm http://localhost:2998/sensors/temperature
$diff = [Math]::Abs($call2.value - $call1.value)
Write-Host "Value: $($call2.value)`u00B0C | Diff: $diff`u00B0C | Same: $(if($call2.value -eq $call1.value) {'YES (50% probability)'} else {'NO'})"

Write-Host "`nTest 3: Call after 500ms (< 2s threshold)" -ForegroundColor Yellow
Start-Sleep -Milliseconds 500
$call3 = irm http://localhost:2998/sensors/temperature
$diff = [Math]::Abs($call3.value - $call2.value)
Write-Host "Value: $($call3.value)`u00B0C | Diff from prev: $diff`u00B0C"

Write-Host "`nTest 4: Call after 2.2s (> 2s threshold)" -ForegroundColor Cyan
Start-Sleep -Milliseconds 2200
$call4 = irm http://localhost:2998/sensors/temperature
$diff = [Math]::Abs($call4.value - $call3.value)
$maxExpected = [Math]::Round([Math]::Pow(2.2 / 10, 2) * 100, 2)
Write-Host "Value: $($call4.value)`u00B0C | Diff: $diff`u00B0C | Max allowed: ~$maxExpected%"

Write-Host "`nTest 5: Additional rapid calls after 300ms (< 2s)" -ForegroundColor Yellow
Start-Sleep -Milliseconds 300
$call5 = irm http://localhost:2998/sensors/temperature
$call5b = irm http://localhost:2998/sensors/temperature
$call5c = irm http://localhost:2998/sensors/temperature
Write-Host "Call 5a: $($call5.value)`u00B0C"
Write-Host "Call 5b: $($call5b.value)`u00B0C"
Write-Host "Call 5c: $($call5c.value)`u00B0C"
Write-Host "Note: Some should be equal (cache effect) when within 2s threshold"

Write-Host "`n=== Testing Humidity Sensor ===" -ForegroundColor Magenta

Write-Host "`nHumidity Call 1:" -ForegroundColor Green
$h1 = irm http://localhost:2998/sensors/humidity
Write-Host "Value: $($h1.value)% | Time: $($h1.timestamp)"

Write-Host "`nHumidity Call 2 after 400ms:" -ForegroundColor Yellow
Start-Sleep -Milliseconds 400
$h2 = irm http://localhost:2998/sensors/humidity
Write-Host "Value: $($h2.value)% | Diff: $([Math]::Abs($h2.value - $h1.value))%"

Write-Host "`nHumidity Call 3 after 2.3s:" -ForegroundColor Cyan
Start-Sleep -Milliseconds 2300
$h3 = irm http://localhost:2998/sensors/humidity
Write-Host "Value: $($h3.value)% | Diff: $([Math]::Abs($h3.value - $h2.value))%"

Write-Host "`n=== Test Complete ===" -ForegroundColor Green
