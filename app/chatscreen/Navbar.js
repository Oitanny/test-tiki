'use client'
import Image from "next/image";

export default function Navbar(){
    return (
        <div className="p-3 flex justify-between">
            <Image src="../" width={50} height={50}/>
            <nav className="">
                <li></li>
            </nav>
        </div>
    );
}
