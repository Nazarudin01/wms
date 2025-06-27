import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const opname = await prisma.stokOpname.findUnique({
      where: { id: params.id },
      include: {
        details: {
          include: { barang: true }
        }
      }
    });
    if (!opname) return NextResponse.json({ error: "Not found" }, { status: 404 });
    let gudangNama = undefined;
    if (opname.gudang) {
      const gudang = await prisma.gudang.findUnique({ where: { id: opname.gudang } });
      gudangNama = gudang?.nama;
    }
    return NextResponse.json({ ...opname, gudangNama });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 