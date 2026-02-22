import { useState } from "react";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, UploadCloud, CheckCircle2, ShieldAlert } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";

// Import fake assets for demo
import idCard1 from "@assets/WhatsApp_Image_2026-02-22_at_10.01.43_AM_1771734711418.jpeg";
import idCard2 from "@assets/WhatsApp_Image_2026-02-22_at_10.02.07_AM_1771734729706.jpeg";

export default function VerifyPage() {
  const { user, verifyStudentId } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  });

  const handleVerification = async () => {
    setIsAnalyzing(true);
    // Simulate AI OCR analysis
    await new Promise(resolve => setTimeout(resolve, 2500));
    verifyStudentId();
    setIsAnalyzing(false);
  };

  const useDemoImage = (src: string) => {
    setUploadedImage(src);
  };

  if (user?.studentIdVerified) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 flex justify-center">
          <Card className="max-w-lg w-full text-center p-8 border-green-500/20 bg-green-50/10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring" }}
            >
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-display font-bold text-green-700 mb-2">Verified Student</h1>
              <p className="text-muted-foreground mb-8">
                Your student ID has been verified successfully. You now have the <span className="font-bold text-foreground">Verified Badge</span> and a <span className="font-bold text-foreground">Trust Score of 95</span>.
              </p>
              <Button className="w-full" variant="outline" onClick={() => window.location.href = "/"}>
                Return to Marketplace
              </Button>
            </motion.div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-display font-bold mb-4">Student ID Verification</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              To ensure safety on MicroPlace, we require all users to verify their student status.
              Upload a clear photo of your Priyadarshini College ID card.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-primary" />
                  Why Verify?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold">1</div>
                  <div>
                    <h4 className="font-semibold">Trust Badge</h4>
                    <p className="text-sm text-muted-foreground">Get a verified badge on your profile that increases buyer confidence.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold">2</div>
                  <div>
                    <h4 className="font-semibold">Higher Trust Score</h4>
                    <p className="text-sm text-muted-foreground">Your dynamic trust score jumps to 95+ instantly.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold">3</div>
                  <div>
                    <h4 className="font-semibold">Access Premium Features</h4>
                    <p className="text-sm text-muted-foreground">Unlock instant buy and premium listing options.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upload ID Card</CardTitle>
                <CardDescription>AI will scan your name and roll number</CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  {...getRootProps()} 
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    uploadedImage ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
                  }`}
                >
                  <input {...getInputProps()} />
                  {uploadedImage ? (
                    <div className="relative">
                      <img src={uploadedImage} alt="Uploaded ID" className="max-h-64 mx-auto rounded-lg shadow-lg" />
                      <p className="mt-4 text-sm text-primary font-semibold">Click to change image</p>
                    </div>
                  ) : (
                    <div className="py-8">
                      <UploadCloud className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-lg font-medium mb-2">Drag & drop your ID here</p>
                      <p className="text-sm text-muted-foreground">or click to browse files</p>
                    </div>
                  )}
                </div>

                {/* Demo Options */}
                <div className="mt-6">
                  <p className="text-xs text-muted-foreground mb-3 text-center uppercase tracking-wide">Or try with demo IDs</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => useDemoImage(idCard1)} className="text-xs border p-2 rounded hover:bg-muted transition-colors">
                      Demo ID 1
                    </button>
                    <button onClick={() => useDemoImage(idCard2)} className="text-xs border p-2 rounded hover:bg-muted transition-colors">
                      Demo ID 2
                    </button>
                  </div>
                </div>

                <div className="mt-8">
                  <Button 
                    className="w-full h-12 text-lg shadow-lg"
                    disabled={!uploadedImage || isAnalyzing}
                    onClick={handleVerification}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Verifying with AI...
                      </>
                    ) : (
                      "Verify Identity"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
