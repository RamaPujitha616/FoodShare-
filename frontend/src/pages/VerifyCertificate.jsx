import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, AlertTriangle, Download, ArrowLeft, ShieldCheck, Award, Calendar, Award as AwardIcon } from 'lucide-react';

const VerifyCertificate = () => {
  const { certificateId } = useParams();
  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/certificates/${certificateId}/verify`);
        if (res.data.success) {
          setCertificate(res.data.data);
          setError(null);
        }
      } catch (err) {
        console.error('Verification error:', err);
        setError(err.response?.data?.message || 'Certificate verification failed. The ID may be invalid.');
      } finally {
        setLoading(false);
      }
    };

    if (certificateId) {
      fetchCertificate();
    }
  }, [certificateId]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      // Public route is not available for download, but if user is logged in, Axios will automatically send their headers.
      // If they are not logged in, we fetch a public link or display a notice.
      // Let's call the download endpoint which requires authentication
      const response = await axios.get(`/api/certificates/${certificateId}/download`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `certificate_${certificateId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Download error:', err);
      alert('To download the official PDF, please log in to your FOODSHARE+ account.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="inline-flex rounded-full bg-red-50 p-4 text-red-500 dark:bg-red-950/20 dark:text-red-400 mb-6">
          <AlertTriangle size={48} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verification Failed</h1>
        <p className="text-gray-650 dark:text-slate-350 mb-8">{error || 'This certificate record could not be found or verified.'}</p>
        <div className="flex flex-col gap-3">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 shadow-md transition-colors"
          >
            <ArrowLeft size={16} /> Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const user = certificate.userId;
  const isNgo = certificate.role === 'ngo';
  const recipientName = isNgo ? (user?.orgName || user?.name) : user?.name;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-550 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-450 transition-colors">
          <ArrowLeft size={16} /> Back to FoodShare+
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-800 transition-colors duration-300">
        {/* Verification Status Header */}
        <div className="bg-emerald-50/50 dark:bg-emerald-950/10 px-6 py-5 border-b border-emerald-100/30 dark:border-slate-700/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-emerald-500 p-2 text-white animate-pulse">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-emerald-800 dark:text-emerald-450">Authenticity Verified</h2>
              <p className="text-xs text-emerald-600 dark:text-emerald-500/80">This is an official, digitally signed FOODSHARE+ certificate.</p>
            </div>
          </div>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {downloading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            ) : (
              <Download size={16} />
            )}
            Download Official PDF
          </button>
        </div>

        {/* Certificate Rendering Mock */}
        <div className="p-8 md:p-12 text-center relative border-b border-gray-100 dark:border-slate-750">
          {/* Certificate Border decoration */}
          <div className="absolute inset-4 pointer-events-none rounded-xl border border-emerald-500/20 dark:border-emerald-500/10"></div>
          <div className="absolute inset-5 pointer-events-none rounded-xl border border-amber-500/10"></div>

          {/* Logo */}
          <div className="mb-4">
            <span className="text-4xl">🥗</span>
            <h1 className="text-lg font-extrabold tracking-wider text-emerald-600 dark:text-emerald-450 mt-1">FOODSHARE+</h1>
          </div>

          <p className="text-xs font-bold tracking-widest text-amber-600 dark:text-amber-500 uppercase mb-3">Certificate of Achievement</p>
          <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-6 font-serif">{certificate.certificateType}</h3>

          <p className="text-xs text-gray-450 dark:text-slate-400 uppercase tracking-wider mb-2">Proudly Presented To</p>
          <h4 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-slate-100 mb-6">{recipientName}</h4>

          <div className="mx-auto max-w-xl text-sm md:text-base text-gray-650 dark:text-slate-300 leading-relaxed mb-8">
            {certificate.certificateType === 'Certificate of Contribution' && (
              <span>Awarded for outstanding volunteer support and dedication, helping serve over <strong className="text-emerald-600 dark:text-emerald-450">{certificate.mealsAchieved} meals</strong> to combat food insecurity and minimize retail surplus waste.</span>
            )}
            {certificate.certificateType === 'Certificate of Community Impact' && (
              <span>Awarded in recognition of tremendous social impact, helping deliver over <strong className="text-emerald-600 dark:text-emerald-450">{certificate.mealsAchieved} meals</strong> to communities in need, in alliance with local hunger relief operations.</span>
            )}
            {certificate.certificateType === 'Gold Donor Recognition Certificate' && (
              <span>Awarded for reaching the esteemed Gold Donor Badge rank, demonstrating exceptional leadership, serving <strong className="text-emerald-600 dark:text-emerald-450">{certificate.mealsAchieved} meals</strong>, and accumulating <strong className="text-emerald-600 dark:text-emerald-450">{certificate.impactPoints} impact points</strong>.</span>
            )}
            {certificate.certificateType === 'Community Impact Partner Certificate' && (
              <span>Awarded for highly active food rescue efforts, distributing over <strong className="text-emerald-600 dark:text-emerald-450">{certificate.mealsAchieved} meals</strong> to food banks and local families.</span>
            )}
            {certificate.certificateType === 'Hunger Relief Excellence Certificate' && (
              <span>Awarded for completed deliveries representing 100 successful surplus distributions, reducing hunger and carbon footprint.</span>
            )}
            {certificate.certificateType === 'Top NGO Recognition Certificate' && (
              <span>Awarded for outstanding delivery performance, completing exceptional food collection tasks and feeding thousands of families.</span>
            )}
          </div>

          {/* SDG Badges */}
          <div className="flex justify-center items-center gap-3 mt-6">
            <div className="flex flex-col items-center bg-red-650 text-white rounded p-1.5 w-12 h-12 justify-center">
              <span className="text-xs font-bold leading-none">SDG 2</span>
              <span className="text-[7px] font-bold mt-0.5 text-center leading-tight">ZERO<br />HUNGER</span>
            </div>
            <div className="flex flex-col items-center bg-green-600 text-white rounded p-1.5 w-12 h-12 justify-center">
              <span className="text-xs font-bold leading-none">SDG 3</span>
              <span className="text-[7px] font-bold mt-0.5 text-center leading-tight">GOOD<br />HEALTH</span>
            </div>
            <div className="flex flex-col items-center bg-amber-600 text-white rounded p-1.5 w-12 h-12 justify-center">
              <span className="text-xs font-bold leading-none">SDG 12</span>
              <span className="text-[7px] font-bold mt-0.5 text-center leading-tight">RESP.<br />CONS.</span>
            </div>
          </div>
        </div>

        {/* Certificate Metadata Details Grid */}
        <div className="bg-gray-50/50 dark:bg-slate-750/30 px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <Award className="text-emerald-500 h-5 w-5 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Recipient Details</p>
              <p className="text-sm font-bold text-gray-800 dark:text-slate-100 mt-1">{recipientName}</p>
              <p className="text-xs text-gray-500 capitalize">{certificate.role} Account</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="text-emerald-500 h-5 w-5 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Date of Issue</p>
              <p className="text-sm font-bold text-gray-800 dark:text-slate-100 mt-1">
                {new Date(certificate.issueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="text-emerald-500 h-5 w-5 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Certificate ID</p>
              <p className="text-sm font-mono font-bold text-gray-800 dark:text-slate-100 mt-1">{certificate.certificateId}</p>
              <p className="text-[10px] text-emerald-600 font-semibold">Digitally Signed & Valid</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificate;
