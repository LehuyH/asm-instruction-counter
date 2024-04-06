ExitProcess proto

.data
arrayPtr dq ?

.code
main proc
	mov rax, -1
	mov rbx, [arrayPtr]
	mov rdx, 0
	;Find the size of the array
	findSizeLoop:
		inc rax
		mov rdx, [rbx+rax*8]
		cmp rdx, -1
	loopne findSizeLoop

dec rax

;SEARCH FOR
mov r8, 7


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
	
	mov r9, [rbx+rax*8]
	
	;COMPARE
	cmp r8,r9

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