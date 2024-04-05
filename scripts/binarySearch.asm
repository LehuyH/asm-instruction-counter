WriteFile proto
ExitProcess proto
.data
array db 0,1,2,3,4,5,6,7,8,9,-1



.code
main proc
	mov rax, -1
	lea rbx, array
	mov rdx, 0
	;Find the size of the array
	findSizeLoop:
		inc rax
		mov dh, [rbx+rax+1]
		cmp dh, -1
	loopne findSizeLoop

;SEARCH FOR
mov r8, 3


;INIT
;left is rsi, right is rdi
mov rsi, 0
mov rdi, rax

binarySearch:
cmp rsi, rdi
jg noResult

	;middle calculation
	mov rax, rsi
	add rax, rdi
	mov rdx, 0
	mov rcx, 2
	div rcx
	
	mov r9b, [rbx+rax]
	cmp r8b,r9b
	;COMPARE
	je found
	jl lessThan
	jg greaterThan

lessThan:
inc rax
mov rdi, rax
jmp binarySearch

greaterThan:
dec rax
mov rsi, rax
jmp binarySearch





noResult:
mov rax,-1

found:



nop
main endp
end