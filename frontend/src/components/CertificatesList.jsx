import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Award, Download, ExternalLink, Calendar, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CertificatesList = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/certificates');
        if (res.data.success) {
          setCertificates(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching certificates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  const handleDownload = async (certificateId) => {
    try {
      setDownloadingId(certificateId);
      const response = await axios.get(`/api/certificates/${certificateId}/download`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `certificate_${certificateId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Failed to download the certificate PDF. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex py-12 justify-center items-center">
        <Loader2 className="animate-spin text-emerald-500 h-8 w-8" />
      </div>
    );
  }

  // Motivating empty state based on role
  if (certificates.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center dark:border-slate-800 bg-white dark:bg-slate-800/50">
        <Award className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4 animate-bounce" />
        <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 mb-1">No Certificates Earned Yet</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
          Certificates are automatically generated and awarded when you reach major contribution milestones. Keep helping to reduce food waste and support communities to unlock them!
        </p>

        <div className="mx-auto max-w-lg text-left bg-gray-50 dark:bg-slate-900/40 p-5 rounded-xl border border-gray-100 dark:border-slate-850">
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-500 uppercase tracking-wider mb-3">Milestones to Unlock:</p>
          {user?.role === 'donor' ? (
            <ul className="space-y-2.5 text-xs text-gray-650 dark:text-slate-350">
              <li className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">1</span>
                <strong>Certificate of Contribution</strong> - 500 meals successfully delivered
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">2</span>
                <strong>Certificate of Community Impact</strong> - 1000 meals successfully delivered
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">3</span>
                <strong>Gold Donor Recognition Certificate</strong> - Reaching the Gold Donor Badge rank
              </li>
            </ul>
          ) : (
            <ul className="space-y-2.5 text-xs text-gray-650 dark:text-slate-350">
              <li className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">1</span>
                <strong>Community Impact Partner</strong> - 500 meals distributed
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">2</span>
                <strong>Hunger Relief Excellence</strong> - 100 successful deliveries completed
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">3</span>
                <strong>Top NGO Recognition Certificate</strong> - 150 deliveries or 2500 impact points
              </li>
            </ul>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
      {certificates.map((cert) => (
        <div
          key={cert._id}
          className="relative overflow-hidden rounded-2xl border border-emerald-100/50 bg-gradient-to-br from-white to-gray-50/55 p-6 shadow-md hover:shadow-lg transition-all dark:border-slate-800 dark:from-slate-800 dark:to-slate-850"
        >
          {/* Decorative Corner Badge */}
          <div className="absolute top-0 right-0 h-16 w-16 pointer-events-none overflow-hidden">
            <div className="absolute transform rotate-45 bg-emerald-500/10 dark:bg-emerald-500/5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 text-center py-1 right-[-35px] top-[15px] w-[120px]">
              CERTIFIED
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
              <Award size={24} />
            </div>

            <div className="flex-grow min-w-0">
              <h4 className="text-base font-bold text-gray-850 dark:text-slate-100 line-clamp-1">
                {cert.certificateType}
              </h4>

              <div className="flex items-center gap-3 mt-1 text-xs text-gray-450 dark:text-gray-450">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(cert.issueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="font-mono bg-gray-100 dark:bg-slate-900 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                  {cert.certificateId}
                </span>
              </div>

              <p className="mt-3 text-xs text-gray-650 dark:text-slate-350 leading-relaxed line-clamp-2">
                {cert.role === 'donor'
                  ? `Awarded for donating ${cert.mealsAchieved} meals and reaching ${cert.impactPoints} points.`
                  : `Awarded for distributing ${cert.mealsAchieved} meals and reaching ${cert.impactPoints} points.`}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-105 dark:border-slate-750">
                <button
                  onClick={() => handleDownload(cert.certificateId)}
                  disabled={downloadingId === cert.certificateId}
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-650 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-350 disabled:opacity-50"
                >
                  {downloadingId === cert.certificateId ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download size={14} />
                  )}
                  Download PDF
                </button>

                <Link
                  to={`/verify-certificate/${cert.certificateId}`}
                  target="_blank"
                  className="flex items-center gap-1.5 text-xs font-bold text-gray-550 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300"
                >
                  <ExternalLink size={14} />
                  Verify Link
                </Link>

                <div className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-emerald-600/80 dark:text-emerald-500/80">
                  <ShieldCheck size={12} />
                  Signed
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CertificatesList;
