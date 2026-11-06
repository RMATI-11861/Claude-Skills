# Scheduling

## Windows Task Scheduler

```powershell
$action = New-ScheduledTaskAction -Execute 'powershell.exe' `
    -Argument '-NoProfile -ExecutionPolicy Bypass -File "C:\Scripts\backup.ps1"'
$trigger = New-ScheduledTaskTrigger -Daily -At 02:00
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Hours 2)
Register-ScheduledTask -TaskName 'Backup diario' -Action $action -Trigger $trigger -Settings $settings
```

- By default the task runs only while the registering user is logged on. To run logged off, register with `-User` and `-Password`, or a service account through `-Principal`; say which one is needed. Other users or highest privileges need an elevated shell.
- Verify: `Get-ScheduledTask -TaskName 'Backup diario' | Get-ScheduledTaskInfo` (check `LastRunTime` and `LastTaskResult` = 0), and run it once with `Start-ScheduledTask`.
- Remove: `Unregister-ScheduledTask -TaskName 'Backup diario' -Confirm:$false`.
- Scheduled tasks do not see mapped drive letters; use UNC paths.

## cron (Linux, macOS)
- `crontab -e`: `0 2 * * * /usr/bin/env bash /opt/scripts/backup.sh >> /var/log/backup.log 2>&1`
- cron runs with a minimal PATH and no profile: use absolute paths and set the needed variables in the script.

## GitHub Actions
- `on: schedule: - cron: '0 5 * * *'` runs in UTC on the default branch; add `workflow_dispatch` for manual runs.
- In public repos, scheduled workflows are disabled after 60 days without repository activity.
