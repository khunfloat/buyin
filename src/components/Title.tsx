import ImcLogo from "#/img/imclogo.svg";
import Image from "next/image";

export default function Title() {
  return (
    <>
      <div className="flex justify-center pb-2">
        <Image
          src={ImcLogo}
          width={80}
          height={80}
          alt="Picture of the author"
        />
      </div>
      <div className="text-center text-3xl font-bold">Intania Music Casino</div>
      <div className="text-center pb-5 text-lg">BuyIn Manager</div>
    </>
  );
}
