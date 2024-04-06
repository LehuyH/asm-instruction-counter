ExitProcess proto

.data
arrayPtr dq ?
.code
main proc
;SEARCH FOR
mov bh, 44

mov rax,-1
mov rcx, [arrayPtr]

linearSearch:
inc rax
mov dh, [rcx+rax]
;COMPARE
cmp dh,-1
je noResult
cmp dh, bh
je found
jmp linearSearch



noResult:
mov rax,-1

found:



nop
main endp
end