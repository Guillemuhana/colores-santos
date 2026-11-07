import {
  House, Building2, Users, Building, Store, Warehouse, Hotel, Stethoscope, BadgeCheck, CalendarCheck,
  ShieldCheck, HardHat, Award, ClipboardList, Clock, TrendingUp, Wrench, PaintRoller, Layers, Droplets,
} from 'lucide-react'

export const SEGMENTS = [
  { to: '/residential', name: 'Residential', icon: House, card: '/img/card-residential.jpg', short: 'Painting, finishes and property upgrades for your home.' },
  { to: '/commercial', name: 'Commercial', icon: Building2, card: '/img/card-commercial.jpg', short: 'Professional painting and finish solutions for offices, retail and commercial spaces.' },
  { to: '/hoa-condominiums', name: 'HOA & Condominiums', icon: Users, card: '/img/card-hoa.jpg', short: 'Reliable painting, stucco and maintenance solutions for HOAs and condominium communities.' },
  { to: '/property-management', name: 'Property Management', icon: Building, card: '/img/card-pm.jpg', short: 'Efficient, high-quality painting and maintenance for multi-unit and rental properties.' },
]

export const INDUSTRIES = [
  [Store, 'Retail & Restaurants'],
  [Building2, 'Offices & Business Parks'],
  [Warehouse, 'Warehouses & Industrial'],
  [Users, 'HOA & Communities'],
  [Hotel, 'Hotels & Hospitality'],
  [Stethoscope, 'Medical & Professional Spaces'],
]

/* Pages not included in the mockups — same structure as the commercial page */
export const SEGMENT_PAGES = {
  hoa: {
    crumb: 'HOA & Condominiums',
    eyebrow: 'Community Services',
    title: ['HOA &', 'Condominium Painting'],
    intro: 'Reliable painting, stucco and maintenance programs for HOAs and condominium communities, planned around your board, residents and budget.',
    hero: '/img/card-hoa.jpg',
    benefits: [
      [ClipboardList, 'Board-Ready Proposals'],
      [Users, 'Resident-Friendly Scheduling'],
      [ShieldCheck, 'Licensed & Insured'],
      [Clock, 'On-Time Phased Projects'],
      [Award, 'Long-Lasting Coatings'],
    ],
    servicesTitle: ['Community', 'Solutions'],
    servicesText: 'Everything your community needs to stay protected, compliant and looking its best.',
    services: [
      [PaintRoller, 'Full Exterior Repaints', 'Buildings, walls, railings and common structures.'],
      [Layers, 'Stucco Repair & Restoration', 'Crack repair, resurfacing and waterproof finishes.'],
      [House, 'Common Area Interiors', 'Lobbies, hallways, stairwells and amenity spaces.'],
      [Droplets, 'Pressure Washing', 'Walkways, pool decks, roofs and building facades.'],
      [Wrench, 'Preventive Maintenance', 'Scheduled touch-ups to protect your investment.'],
      [BadgeCheck, 'Color Consulting', 'Palette proposals and samples for board approval.'],
    ],
    process: [
      ['Site Assessment', 'We inspect the property and document current conditions.'],
      ['Proposal & Approval', 'A clear scope, timeline and budget for your board.'],
      ['Phased Execution', 'Work organized by building or area with resident notices.'],
      ['Final Walkthrough', 'We review every area with management before closing.'],
    ],
    gallery: ['/img/card-hoa.jpg', '/img/stucco-g1.jpg', '/img/pressure-g3.jpg'],
    cta: ['Planning Your Next', 'Community Project?'],
    ctaText: 'Request a free site visit and a board-ready proposal for your HOA or condominium.',
  },
  pm: {
    crumb: 'Property Management',
    eyebrow: 'Property Management',
    title: ['Painting & Maintenance', 'for Property Managers'],
    intro: 'Fast, consistent and high-quality painting and maintenance for multi-unit and rental properties, so your units are ready on time.',
    hero: '/img/card-pm.jpg',
    benefits: [
      [Clock, 'Fast Unit Turnovers'],
      [CalendarCheck, 'Flexible Scheduling'],
      [ClipboardList, 'Clear Pricing & Reports'],
      [HardHat, 'Safe & Professional Crew'],
      [TrendingUp, 'Higher Rental Value'],
    ],
    servicesTitle: ['Property', 'Solutions'],
    servicesText: 'One reliable partner for every unit, building and common area you manage.',
    services: [
      [House, 'Make-Ready & Turnovers', 'Interior repaints to get units rent-ready quickly.'],
      [Wrench, 'Drywall & Minor Repairs', 'Holes, cracks, water damage and patching.'],
      [PaintRoller, 'Exterior Repaints', 'Durable coatings built for Florida weather.'],
      [Layers, 'Stucco & Surface Repair', 'Restore and protect building exteriors.'],
      [Droplets, 'Exterior Cleaning', 'Pressure washing for buildings and walkways.'],
      [BadgeCheck, 'Ongoing Maintenance Plans', 'Scheduled service for your entire portfolio.'],
    ],
    process: [
      ['Request', 'Send us the unit or property and the scope you need.'],
      ['Quote & Schedule', 'Fast, clear quote and a date that fits your timeline.'],
      ['Execute', 'Our team completes the work cleanly and on time.'],
      ['Report & Walkthrough', 'Photos and a final review so you can close the ticket.'],
    ],
    gallery: ['/img/card-pm.jpg', '/img/interior-g1.jpg', '/img/drywall-g1.jpg'],
    cta: ['Need a Reliable', 'Maintenance Partner?'],
    ctaText: "Tell us about your properties and let's set up a plan that keeps your units ready.",
  },
}
