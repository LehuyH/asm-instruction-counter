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
		mov dh, [rbx+rax]
		cmp dh, -1
	loopne findSizeLoop

	;Bubble sort
	dec rax
	bubbleSortOuter:
		
		mov rcx,rax
		mov rsi, 0
			bubbleSortInner:
				mov dh, [rbx+rsi]
				mov dl, [rbx+rsi+1]
				;COMPARE
				cmp dh, dl
				jg swap
				postSwap:
				inc rsi
			loop bubbleSortInner
		dec rax
		mov rcx, rax
		inc rcx
		loop bubbleSortOuter
	    ;done sorting
		jmp done



	swap:
		mov [rbx+rsi], dl
		mov [rbx+rsi+1], dh
		jmp postSwap
	
	done:
	nop
    call ExitProcess
main endp
end