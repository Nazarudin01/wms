import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { format } from "date-fns";

export async function GET() {
  try {
    const today = new Date();
    const month = format(today, "MM");
    const year = format(today, "yy");

    // Get the last nomor for this month
    const lastStokMasuk = await prisma.stokMasuk.findFirst({
      where: {
        nomor: {
          startsWith: `SM-${month}${year}-`,
        },
      },
      orderBy: {
        nomor: "desc",
      },
    });

    console.log("LAST NOMOR:", lastStokMasuk?.nomor);

    let sequence = 1;
    if (lastStokMasuk) {
      const lastSequence = parseInt(lastStokMasuk.nomor.split("-")[2]);
      sequence = lastSequence + 1;
    }

    const nomor = `SM-${month}${year}-${sequence.toString().padStart(3, "0")}`;

    // Debug: tampilkan semua nomor stok masuk bulan berjalan
    const all = await prisma.stokMasuk.findMany({
      where: {
        nomor: {
          startsWith: `SM-${month}${year}-`,
        },
      },
      orderBy: { nomor: "desc" },
    });
    console.log("ALL NOMOR STOK MASUK BULAN INI:", all.map(x => x.nomor));

    return NextResponse.json({ nomor }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Error generating nomor:", error);
    return NextResponse.json(
      { error: "Failed to generate nomor" },
      { status: 500 }
    );
  }
} 