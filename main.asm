WriteFile proto
ExitProcess proto
.data
;N=16 Random
array db 0,5,13,12,7,14,10,9,15,8,3,4,6,11,2,16,1,-1
;N=16 Best Case
;array db 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,-1
;N=16 Worse case
; array db 16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0,-1


;binary search
;linear search



.code
main proc
	mov rax, -1
	lea rbx, array
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
			loop bubbleSortInner ; prob a compare here too with loops/rcx
		dec rax
		mov rcx, rax
		inc rcx
		loop bubbleSortOuter
	    ;done sorting
		jmp done



	swap:
		;SWAP
		mov [rbx+rsi], dl
		mov [rbx+rsi+1], dh
		jmp postSwap
	
	done:
	nop
    call ExitProcess
main endp
end