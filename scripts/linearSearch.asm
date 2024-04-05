WriteFile proto
ExitProcess proto
.data
array db 234,20,6,73,15,6,73,3,6,100,6,3,43,-1





.code
main proc

;SEARCH FOR
mov bh, 44

mov rax,-1
lea rcx, array

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