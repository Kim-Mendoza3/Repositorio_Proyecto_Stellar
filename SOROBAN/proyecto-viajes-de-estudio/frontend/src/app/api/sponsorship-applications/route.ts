import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

const isNetlify = process.env.NETLIFY === 'true';
const DATA_DIR = isNetlify ? '/tmp/viajar-data' : path.join(process.cwd(), 'data');
const APPLICATIONS_FILE = path.join(DATA_DIR, 'sponsorship-applications.json');
const TRIPS_FILE = path.join(DATA_DIR, 'trips.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readApplications() {
  ensureDataDir();

  if (!fs.existsSync(APPLICATIONS_FILE)) {
    fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify([]));
    return [];
  }

  try {
    const raw = fs.readFileSync(APPLICATIONS_FILE, 'utf-8').replace(/^\uFEFF/, '').trim();
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeApplications(applications: any[]) {
  ensureDataDir();
  fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify(applications, null, 2));
}

function readTrips() {
  ensureDataDir();

  if (!fs.existsSync(TRIPS_FILE)) {
    return [];
  }

  try {
    const raw = fs.readFileSync(TRIPS_FILE, 'utf-8').replace(/^\uFEFF/, '').trim();
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyWallet = searchParams.get('companyWallet');
    const studentWallet = searchParams.get('studentWallet');

    const all = readApplications();

    let applications = all;
    if (companyWallet) {
      applications = all.filter((a: any) => a.companyWallet === companyWallet);
    }

    if (studentWallet) {
      applications = applications.filter((a: any) => a.studentWallet === studentWallet);
    }

    applications.sort((a: any, b: any) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({
      success: true,
      applications,
      count: applications.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Error cargando postulaciones' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const requiredFields = [
      'tripId',
      'tripName',
      'companyWallet',
      'companyName',
      'studentWallet',
      'studentName',
      'studentEmail',
      'whyJoin',
      'whyInterested',
      'eventContribution',
      'futureContribution',
      'acceptedTerms',
    ];

    const missing = requiredFields.filter((field) => !body[field]);
    if (missing.length > 0) {
      return NextResponse.json(
        { success: false, error: `Campos requeridos faltantes: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    if (body.acceptedTerms !== true) {
      return NextResponse.json(
        { success: false, error: 'Debes aceptar los terminos y condiciones' },
        { status: 400 }
      );
    }

    const all = readApplications();

    const alreadyApplied = all.find(
      (a: any) => a.tripId === body.tripId && a.studentWallet === body.studentWallet
    );

    if (alreadyApplied) {
      return NextResponse.json(
        { success: false, error: 'Ya existe una postulación para este viaje' },
        { status: 409 }
      );
    }

    const trips = readTrips();
    const trip = trips.find((t: any) => t.id === body.tripId && t.companyWallet === body.companyWallet);

    if (trip?.maxApplications && Number.isFinite(trip.maxApplications)) {
      const activeApplicationsCount = all.filter(
        (application: any) =>
          application.tripId === body.tripId &&
          (application.status === 'pending' || application.status === 'accepted')
      ).length;

      if (activeApplicationsCount >= trip.maxApplications) {
        return NextResponse.json(
          { success: false, error: 'Se alcanzo el maximo de postulantes para esta oferta' },
          { status: 409 }
        );
      }
    }

    const application = {
      id: `application_${Date.now()}`,
      tripId: body.tripId,
      tripName: body.tripName,
      destination: body.destination || '',
      companyWallet: body.companyWallet,
      companyName: body.companyName,
      studentWallet: body.studentWallet,
      studentName: body.studentName,
      studentEmail: body.studentEmail,
      studentPhone: body.studentPhone || '',
      studentSchool: body.studentSchool || '',
      whyJoin: body.whyJoin,
      whyInterested: body.whyInterested,
      eventContribution: body.eventContribution,
      futureContribution: body.futureContribution,
      acceptedTerms: true,
      status: 'pending',
      createdAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedBy: null,
    };

    all.push(application);
    writeApplications(all);

    return NextResponse.json({ success: true, application }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Error creando postulación' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { applicationId, companyWallet, status } = body;

    if (!applicationId || !companyWallet || !status) {
      return NextResponse.json(
        { success: false, error: 'applicationId, companyWallet y status son requeridos' },
        { status: 400 }
      );
    }

    if (status !== 'accepted' && status !== 'rejected') {
      return NextResponse.json(
        { success: false, error: 'status debe ser accepted o rejected' },
        { status: 400 }
      );
    }

    const all = readApplications();
    let updatedApplication: any = null;

    const updated = all.map((application: any) => {
      if (application.id === applicationId && application.companyWallet === companyWallet) {
        updatedApplication = {
          ...application,
          status,
          reviewedAt: new Date().toISOString(),
          reviewedBy: companyWallet,
        };
        return updatedApplication;
      }
      return application;
    });

    if (!updatedApplication) {
      return NextResponse.json(
        { success: false, error: 'Postulación no encontrada' },
        { status: 404 }
      );
    }

    writeApplications(updated);

    return NextResponse.json({ success: true, application: updatedApplication });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Error actualizando postulación' },
      { status: 500 }
    );
  }
}
