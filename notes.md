asm command:
ml64.exe /c /nologo /Zi /Fo"main.obj" /W3 /errorReport:prompt  /Tamain.asm

link command:
link.exe /ERRORREPORT:PROMPT /OUT:"main.exe" /NOLOGO kernel32.lib user32.lib gdi32.lib winspool.lib comdlg32.lib advapi32.lib shell32.lib ole32.lib oleaut32.lib uuid.lib odbc32.lib odbccp32.lib /SUBSYSTEM:CONSOLE /LARGEADDRESSAWARE:NO /TLBID:1 /ENTRY:"main" /NXCOMPAT /MACHINE:X64 main.obj
