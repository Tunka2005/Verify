'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import IDVerificationFlow from '@/components/verification/id-verification-flow'
import FaceMatch from '@/components/verification/face-match'
import VerificationSuccess from '@/components/verification/verification-success'
import type { ExtractedDocumentData, FaceMatchVerifyResult, VerificationRecord } from '@/types/verification'

export default function VerifyPage() {
  const [step, setStep] = useState(0)
  const [uploadedID, setUploadedID] = useState<{ front?: string; back?: string }>({})
  const [documentData, setDocumentData] = useState<ExtractedDocumentData | null>(null)
  const [verificationRecord, setVerificationRecord] = useState<VerificationRecord | null>(null)
  const startTimeRef = useRef<number>(Date.now())

  const handleIDUpload = (front?: string, back?: string) => {
    if (front) setUploadedID((prev: { front?: string; back?: string }) => ({ ...prev, front }))
    if (back) setUploadedID((prev: { front?: string; back?: string }) => ({ ...prev, back }))
  }

  const handleIDComplete = (data: ExtractedDocumentData) => {
    setDocumentData(data)
    startTimeRef.current = Date.now()
    setStep(1)
  }

  const handleFaceMatchComplete = (_image: string, result: FaceMatchVerifyResult) => {
    const matchConfidence = result.confidence || result.match_percentage || 0
    const isVerified = matchConfidence >= 55
    const elapsedMs = Date.now() - startTimeRef.current

    setVerificationRecord({
      verified: isVerified,
      confidence: matchConfidence,
      userName: documentData?.name || 'Unknown',
      documentNumber: documentData?.idNumber || documentData?.documentNumber,
      matchSimilarity: result.similarity != null ? result.similarity * 100 : undefined,
      documentConfidence: documentData?.confidence,
      elapsedTime: `${(elapsedMs / 1000).toFixed(1)}s`,
    })
    setStep(2)
  }

  const computedResult: VerificationRecord = verificationRecord ?? {
    verified: false,
    confidence: 0,
    userName: documentData?.name || 'Unknown',
    documentNumber: documentData?.documentNumber || documentData?.idNumber,
    documentConfidence: documentData?.confidence,
  }

  const steps = [
    <IDVerificationFlow
      key="id"
      onComplete={handleIDComplete}
      onUpload={handleIDUpload}
    />,
    <FaceMatch
      key="face-match"
      idImage={uploadedID.front}
      onComplete={handleFaceMatchComplete}
    />,
    <VerificationSuccess
      key="success"
      result={computedResult}
    />,
  ]

  return (
    <main className="min-h-screen bg-background">
      {step < 2 && (
        <div className="fixed top-4 left-4 z-50">
          {step === 0 ? (
            <Link
              href="/choose-method"
              className="inline-flex items-center gap-2 bg-background border-3 border-foreground px-4 py-2 font-bold text-sm uppercase tracking-wider shadow-[4px_4px_0px_var(--foreground)] hover:shadow-[2px_2px_0px_var(--foreground)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Буцах
            </Link>
          ) : (
            <button
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center gap-2 bg-background border-3 border-foreground px-4 py-2 font-bold text-sm uppercase tracking-wider shadow-[4px_4px_0px_var(--foreground)] hover:shadow-[2px_2px_0px_var(--foreground)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Буцах
            </button>
          )}
        </div>
      )}
      {steps[step]}
    </main>
  )
}
