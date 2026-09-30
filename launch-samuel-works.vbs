Option Explicit

Dim shell, fso, projectPath, edgePath, fileUrl, command
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

projectPath = fso.GetParentFolderName(WScript.ScriptFullName)
edgePath = shell.ExpandEnvironmentStrings("%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe")
If Not fso.FileExists(edgePath) Then edgePath = shell.ExpandEnvironmentStrings("%ProgramFiles%\Microsoft\Edge\Application\msedge.exe")
If Not fso.FileExists(edgePath) Then edgePath = "msedge.exe"

fileUrl = "file:///" & Replace(projectPath & "\index.html", "\", "/")
command = """" & edgePath & """ --app=""" & fileUrl & """"
shell.Run command, 1, False