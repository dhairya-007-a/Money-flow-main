Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
electronExe = scriptDir & "\node_modules\electron\dist\electron.exe"

If fso.FileExists(electronExe) Then
    ' Run native desktop application directly with ZERO cmd window
    WshShell.Run """" & electronExe & """ """ & scriptDir & """", 1, False
Else
    batPath = scriptDir & "\Launch Desktop App.bat"
    WshShell.Run "cmd /c """ & batPath & """", 0, False
End If
