export const decimalToHex = (d:number) => {
  return d.toString(16).toUpperCase()
}

export const hexToDecimal = (hex:string) =>{
  return parseInt(hex,16)
}

export const bigEndianByteToHex = (byte:Uint8Array) => {
  return Array.from(byte).map((b) => decimalToHex(b)).reverse().filter(e=>e).join('')
}