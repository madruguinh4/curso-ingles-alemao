import zlib, struct, math, os
def png(size, path):
    bg=(15,23,42); fg=(96,165,250); cx=cy=size/2; r=size*0.34
    rows=[]
    for y in range(size):
        row=bytearray([0])
        for x in range(size):
            d=math.hypot(x+0.5-cx,y+0.5-cy)
            a=max(0,min(1,r-d+0.5))
            row+=bytes(int(bg[i]*(1-a)+fg[i]*a) for i in range(3))
        rows.append(bytes(row))
    raw=b''.join(rows)
    def chunk(t,d): return struct.pack('>I',len(d))+t+d+struct.pack('>I',zlib.crc32(t+d)&0xffffffff)
    data=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',size,size,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(raw,9))+chunk(b'IEND',b'')
    open(path,'wb').write(data)
os.makedirs('public/icons',exist_ok=True)
png(192,'public/icons/icon-192.png'); png(512,'public/icons/icon-512.png')
print('icons ok')
