"use client";

import { useCallback, useState } from "react";
import TextMorph from "@/componets/page";
import { useTimer } from "react-use-precision-timer";

export default function Home() {
  const [seconds, setSeconds] = useState(60);
  let isActive: boolean = false;
  let Tense = (seconds - seconds%10)/10 ;
  let once = seconds%10 ;
  const timer = useTimer(
    { delay: 1000 },
    useCallback(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          timer.stop();
          return 0;
        }
        return prev - 1;
      });
    }, [])
  );


    if (seconds%10 == 0){
     isActive =  true;
  } 

  if (seconds%10 == 9 ){
     isActive =  true;
  } 

  else{
    isActive = false;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-col items-center">
       
      <div className  =  "flex justify-center align-middle gap-5" >
       {/* Seconds  */}
       <div className=" flex justify-center align-middle">
        <TextMorph
          words={String (Tense)  }
         
          color="#ffffff"
          font={{
            fontFamily: "Inter",
            fontSize: "120px",
            fontWeight: 500,
            lineHeight: 1,
          }}
          play = {isActive? true: false }
          transition={{
            duration: 1,
            ease: "easeOut",
          }}
        />
      
        <TextMorph
          words={String(seconds%10)}
          color="#ffffff"
          font={{
            fontFamily: "Inter",
            fontSize: "128px",
            fontWeight: 500,
            lineHeight: 1,
          }}
          transition={{
            duration: 1,
            ease: "easeOut",
          }}
        />
        </div>
      

      {/* mins */}
      
      <div className=" flex justify-center align-middle">
        <TextMorph
          words={String( (seconds - seconds%10)/10 )  }
         
          color="#ffffff"
          font={{
            fontFamily: "Inter",
            fontSize: "120px",
            fontWeight: 500,
            lineHeight: 1,
          }}
          play = {isActive? true: false }
          transition={{
            duration: 1,
            ease: "easeOut",
          }}
        />
      
        <TextMorph
          words={String(once)}
          color="#ffffff"
          font={{
            fontFamily: "Inter",
            fontSize: "128px",
            fontWeight: 500,
            lineHeight: 1,
          }}
          transition={{
            duration: 1,
            ease: "easeOut",
          }}
        />
        </div>


        {/* hour */}

         <div className=" flex justify-center align-middle">
        <TextMorph
          words={String( (seconds - seconds%10)/10 )  }
         
          color="#ffffff"
          font={{
            fontFamily: "Inter",
            fontSize: "120px",
            fontWeight: 500,
            lineHeight: 1,
          }}
          play = {isActive? true: false }
          transition={{
            duration: 1,
            ease: "easeOut",
          }}
        />
      
        <TextMorph
          words={String(once)}
          color="#ffffff"
          font={{
            fontFamily: "Inter",
            fontSize: "128px",
            fontWeight: 500,
            lineHeight: 1,
          }}
          transition={{
            duration: 1,
            ease: "easeOut",
          }}
        />
        </div>

       </div>


        <button
          onClick={() => {
            setSeconds(60);
            timer.start();
          }}
          className="mt-8 rounded-full border border-zinc-700 px-6 py-3 text-white cursor-pointer hover:bg-gray-900 tr" 
        >
          Start
        </button>
      </main>
    </div>
  );
}