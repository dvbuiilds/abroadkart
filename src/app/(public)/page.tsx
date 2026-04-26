"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Building2,
  Globe,
  Users,
  TrendingUp,
  Link2,
  Link2Off,
  TriangleAlert,
  Clock,
  DollarSign,
  CircleCheck,
  Handshake,
  Megaphone,
  Cog,
  ChartColumn,
  Zap,
  Heart,
  Feather,
  GraduationCap,
  Languages,
  FileText,
  FileCheck,
  Wallet,
  CreditCard,
  Building,
  Shield,
  Plane,
  House,
  Car,
  Smartphone,
  Bus,
  MapPin,
  Briefcase,
  ChevronDown,
  ArrowRight,
  MessageCircle,
  Mail,
  Phone,
  Server,
  RefreshCw,
  Earth,
  ShieldCheck,
  X,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@app/components/ui/dialog";

export default function HomePage() {
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const navbarHeight = 64;
      const offsetPosition =
        element.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-900">
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.15) 1px, transparent 0px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800" />
        <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-sm text-white/70 font-medium">
                Your Trusted Services Partner
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-[1.1] tracking-tight mb-8">
              End-to-End Student Services for{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                  Study Abroad Companies
                </span>
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto mb-12">
              Offer every essential student service without building vendor
              partnerships or expanding your internal team. One partner.
              Complete delivery.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => scrollToSection("contact")}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow py-2 h-14 px-8 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base rounded-full transition-all duration-300 hover:shadow-[0_0_40px_rgba(37,99,235,0.3)]"
              >
                Partner With Us
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button
                onClick={() => scrollToSection("services")}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border shadow-sm py-2 h-14 px-8 bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white font-medium text-base rounded-full cursor-pointer"
              >
                See Services
              </button>
            </div>
            <div className="mt-20 pt-12 border-t border-white/10">
              <p className="text-sm text-gray-500 mb-6 uppercase tracking-widest">
                Trusted by leading consultancies across
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-gray-400">
                <span className="text-sm font-medium tracking-wide">India</span>
                <span className="text-sm font-medium tracking-wide">UAE</span>
                <span className="text-sm font-medium tracking-wide">Nepal</span>
                <span className="text-sm font-medium tracking-wide">
                  Bangladesh
                </span>
                <span className="text-sm font-medium tracking-wide">
                  Sri Lanka
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="text-white/30 cursor-pointer">
            <ChevronDown className="w-8 h-8" />
          </div>
        </div>
      </section>

      {/* Audience Section */}
      <section id="audience" className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mb-16 md:mb-20">
            <span className="text-blue-600 font-medium text-sm tracking-wide uppercase mb-4 block">
              Who This Is For
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 leading-tight mb-6">
              Built for Ambitious Study Abroad Companies
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              AbroadKart partners with consultancies that are ready to serve
              students better while focusing on what they do best—counseling and
              admissions.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            <div className="group p-8 md:p-10 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-500">
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-blue-600 transition-colors duration-300">
                  <Building2 className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Study Abroad Consultancies
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Independent consultancies seeking to expand service
                    offerings without operational complexity.
                  </p>
                </div>
              </div>
            </div>
            <div className="group p-8 md:p-10 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-500">
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-blue-600 transition-colors duration-300">
                  <Globe className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Overseas Education Companies
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Multi-country operations requiring standardized service
                    delivery across geographies.
                  </p>
                </div>
              </div>
            </div>
            <div className="group p-8 md:p-10 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-500">
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-blue-600 transition-colors duration-300">
                  <Users className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    High-Volume Businesses
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Companies handling 100+ to 10,000+ students annually who
                    need scalable service infrastructure.
                  </p>
                </div>
              </div>
            </div>
            <div className="group p-8 md:p-10 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-500">
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-blue-600 transition-colors duration-300">
                  <TrendingUp className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Growth-Focused Leaders
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Teams that want to increase revenue per student without
                    increasing headcount.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Problem Section */}
      <section className="py-24 md:py-32 bg-gray-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gray-800/50 to-transparent" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-500/5 rounded-full blur-[100px]" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <div>
              <span className="text-blue-500 font-medium text-sm tracking-wide uppercase mb-4 block">
                The Industry Problem
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white leading-tight mb-6">
                Vendor Management Is Broken
              </h2>
              <p className="text-lg text-gray-400 leading-relaxed mb-8">
                Study abroad consultancies lose revenue and control because
                services are fragmented across dozens of vendors. The result?
                Frustrated students, overwhelmed teams, and missed
                opportunities.
              </p>
              <div className="flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-xl">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-500">73%</span>
                </div>
                <p className="text-gray-300 text-sm">
                  of consultancies report that vendor management is their
                  biggest operational challenge
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors duration-300">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Link2Off className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Fragmented Services
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Students navigate between multiple vendors, creating confusion
                  and delays at critical moments.
                </p>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors duration-300">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                  <TriangleAlert className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Inconsistent Quality
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Different vendors mean different service levels. SLAs are
                  rarely met, and escalations are common.
                </p>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors duration-300">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Operational Drain
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Your team spends more time coordinating vendors than advising
                  students.
                </p>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors duration-300">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Hidden Costs
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Managing multiple partnerships comes with administrative
                  overhead that erodes margins.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What AbroadKart Does Section - abbreviated for length, full content from index.tsx */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
            <span className="text-blue-600 font-medium text-sm tracking-wide uppercase mb-4 block">
              What AbroadKart Does
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 leading-tight mb-6">
              Your Complete Service Backbone
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              AbroadKart acts as a single service infrastructure that
              consultancies plug into. We handle all student services so you can
              focus on what matters.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div className="p-8 md:p-10 bg-gray-900 rounded-3xl h-full">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-xl font-bold text-white">A</span>
                </div>
                <div>
                  <p className="text-blue-500 text-sm font-medium">
                    AbroadKart
                  </p>
                  <h3 className="text-xl font-semibold text-white">
                    We Manage
                  </h3>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  "Vendor selection & vetting",
                  "Quality control & SLAs",
                  "Service coordination",
                  "End-to-end execution",
                  "Escalation handling",
                  "Standardized processes",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-gray-300"
                  >
                    <CircleCheck className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-8 md:p-10 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 rounded-3xl h-full">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-900">You</span>
                </div>
                <div>
                  <p className="text-blue-700 text-sm font-medium">Your Team</p>
                  <h3 className="text-xl font-semibold text-gray-900">
                    You Focus On
                  </h3>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  "Student counseling",
                  "University admissions",
                  "Building student trust",
                  "Growing your business",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-gray-700"
                  >
                    <CircleCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section - id for scroll target */}
      <section id="services" className="py-24 md:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
            <span className="text-blue-600 font-medium text-sm tracking-wide uppercase mb-4 block">
              Complete Service Suite
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 leading-tight mb-6">
              Every Service Under One Roof
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              From test preparation to post-arrival settlement, AbroadKart
              delivers every service your students need—managed, coordinated,
              and executed seamlessly.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            <div className="p-8 md:p-10 bg-white rounded-2xl border border-blue-100">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-1 h-12 bg-blue-500 rounded-full" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Pre-Admission & Application Support
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Test Preparation, Document Translation, Notary, Application
                    Support
                  </p>
                </div>
              </div>
            </div>
            <div className="p-8 md:p-10 bg-white rounded-2xl border border-emerald-100">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-1 h-12 bg-emerald-500 rounded-full" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Financial & Travel Services
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Student Loans, Forex, Bank Account, Insurance, Flight
                    Booking
                  </p>
                </div>
              </div>
            </div>
            <div className="p-8 md:p-10 bg-white rounded-2xl border border-violet-100">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-1 h-12 bg-violet-500 rounded-full" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Accommodation & Arrival
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Student Housing, Airport Pickup, Local SIM, Transport Passes
                  </p>
                </div>
              </div>
            </div>
            <div className="p-8 md:p-10 bg-white rounded-2xl border border-blue-100">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-1 h-12 bg-blue-500 rounded-full" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Post-Arrival & Settlement
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Local Onboarding, Compliance Assistance, Essential Services
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - abbreviated */}
      <section id="process" className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
            <span className="text-blue-600 font-medium text-sm tracking-wide uppercase mb-4 block">
              How It Works
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 leading-tight mb-6">
              Simple Partnership, Complete Transformation
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Getting started with AbroadKart is straightforward. Here&apos;s
              how we work together to deliver exceptional student experiences.
            </p>
          </div>
          <div className="text-center mt-16">
            <button
              onClick={() => scrollToSection("contact")}
              className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors cursor-pointer"
            >
              Start the conversation
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Benefits - abbreviated */}
      <section
        id="benefits"
        className="py-24 md:py-32 bg-gray-900 relative overflow-hidden"
      >
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
            <span className="text-blue-500 font-medium text-sm tracking-wide uppercase mb-4 block">
              Why Choose AbroadKart
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white leading-tight mb-6">
              The Competitive Advantage You Need
            </h2>
            <p className="text-lg text-gray-400 leading-relaxed">
              Leading consultancies choose AbroadKart because we transform how
              they deliver services—making them more profitable, efficient, and
              student-focused.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="py-24 md:py-32 bg-gray-900 relative overflow-hidden"
      >
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/20 rounded-full blur-[150px]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div>
              <span className="text-blue-500 font-medium text-sm tracking-wide uppercase mb-4 block">
                Let&apos;s Partner
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white leading-tight mb-6">
                Deliver a Complete Study Abroad Experience Without Operational
                Complexity
              </h2>
              <p className="text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto mb-10">
                Join the growing network of consultancies that have transformed
                their operations with AbroadKart. One conversation could change
                how you do business.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button
                onClick={() => setIsPartnerModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow py-2 h-14 px-8 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base rounded-full transition-all duration-300 hover:shadow-[0_0_40px_rgba(37,99,235,0.4)] cursor-pointer"
              >
                Become a Partner
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <a
                href="https://wa.me/918318899608"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border shadow-sm py-2 h-14 px-8 bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white font-medium text-base rounded-full cursor-pointer"
              >
                <MessageCircle className="mr-2 w-5 h-5" />
                Talk to Us
              </a>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-gray-400">
              <a
                href="mailto:partners@abroadkart.com"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>partners@abroadkart.com</span>
              </a>
              <a
                href="tel:+918318899608"
                className="flex items-center gap-2 hover:text-blue-400 transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span className="font-medium">Call Now: +91-8318899608</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Form Modal */}
      <Dialog open={isPartnerModalOpen} onOpenChange={setIsPartnerModalOpen}>
        <DialogContent className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="sticky top-0 bg-white border-b border-gray-100 p-6 flex flex-row items-center justify-between rounded-t-3xl z-10 space-y-0">
            <div className="flex flex-col">
              <DialogTitle className="text-2xl font-semibold text-gray-900">
                Become a Partner
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-1">
                Fill out the form below and we&apos;ll get back to you within 24
                hours
              </DialogDescription>
            </div>
            <button
              onClick={() => setIsPartnerModalOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-120px)] w-full">
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSfgjIBhj9KJlSkkgemnYatYDxegPHNEN_Ca8jxh6y5-Dxwy5g/viewform?embedded=true"
              width="100%"
              height="2000"
              frameBorder="0"
              marginHeight={0}
              marginWidth={0}
              scrolling="yes"
              className="w-full"
              style={{ minHeight: "2000px" }}
              title="Become a Partner form"
            >
              Loading…
            </iframe>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
