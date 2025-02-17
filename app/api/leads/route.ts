import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/db';
import Lead from '../../../models/lead';
import { z } from 'zod';

// Request validation schemas
const QuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  search: z.string().optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'converted', 'all']).optional(),
  sortBy: z.enum(['createdAt', 'name', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

const LeadSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().regex(/^\+?[0-9\s-()]{8,}$/).optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  source: z.string().default('manual'),
  status: z.enum(['new', 'contacted', 'qualified', 'converted']).default('new'),
  notes: z.string().optional()
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = QuerySchema.parse(Object.fromEntries(searchParams));
    
    await connectDB();

    // Build query
    const query: any = {};
    if (params.search) {
      query.$or = [
        { name: { $regex: params.search, $options: 'i' } },
        { email: { $regex: params.search, $options: 'i' } },
        { address: { $regex: params.search, $options: 'i' } }
      ];
    }
    if (params.status && params.status !== 'all') {
      query.status = params.status;
    }

    const skip = (params.page - 1) * params.limit;
    const sortField = { [params.sortBy]: params.sortOrder === 'desc' ? -1 : 1 };
    
    const [leads, total] = await Promise.all([
      Lead.find(query)
        // .sort(sortField)
        .skip(skip)
        .limit(params.limit)
        .select('-__v')
        .lean()
        .exec(),
      Lead.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      data: leads,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        pages: Math.ceil(total / params.limit)
      },
      meta: {
        query: params.search || null,
        status: params.status || 'all',
        sortBy: params.sortBy,
        sortOrder: params.sortOrder
      }
    });

  } catch (error) {
    console.error('GET /api/leads error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid query parameters',
        details: error.errors
      }, { status: 400 });
    }
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leads' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = LeadSchema.parse(body);
    
    await connectDB();

    // Check for duplicate leads
    const existingLead = await Lead.findOne({
      $or: [
        { email: validatedData.email },
        { phone: validatedData.phone }
      ]
    });

    if (existingLead) {
      return NextResponse.json({
        success: false,
        error: 'Lead already exists',
        existingLead
      }, { status: 409 });
    }
    
    const lead = await Lead.create({
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return NextResponse.json({
      success: true,
      data: lead
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/leads error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 });
    }
    return NextResponse.json({
      success: false,
      error: 'Failed to create lead'
    }, { status: 500 });
  }
}
