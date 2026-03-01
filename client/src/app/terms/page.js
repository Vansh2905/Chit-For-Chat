import React from 'react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden pt-24 pb-16 lg:pt-32 lg:pb-24">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="bg-card/80 backdrop-blur-xl border border-border p-8 md:p-12 rounded-3xl shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 border border-primary/20">
            <ShieldIcon className="w-4 h-4" />
            <span>Legal</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">Terms of Service</h1>
          <p className="text-sm font-medium text-muted-foreground mb-8 pb-8 border-b border-border/50">Last Updated: 28/02/2026</p>

          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <p className="text-lg">
              Welcome to Chit-For-Chat ("we", "our", or "us"). By accessing or using our website and services, you agree to the following Terms of Service. If you do not agree, please do not use the platform.
            </p>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="text-primary bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0">1</span>
                Acceptance of Terms
              </h2>
              <div className="pl-10 space-y-2">
                <p>By creating an account or using Chit-For-Chat, you confirm that:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>You are at least 13 years old.</li>
                  <li>You agree to comply with these Terms.</li>
                  <li>You will use the platform lawfully and responsibly.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="text-primary bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0">2</span>
                Description of Service
              </h2>
              <div className="pl-10 space-y-2">
                <p>Chit-For-Chat provides:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Real-time messaging</li>
                  <li>Image sharing</li>
                  <li>User profile features</li>
                  <li>Online/offline status indicators</li>
                </ul>
                <p className="mt-2 text-foreground/80 font-medium">We reserve the right to modify or discontinue features at any time without notice.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="text-primary bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0">3</span>
                User Accounts
              </h2>
              <div className="pl-10 space-y-4">
                <div>
                  <p className="mb-2">You are responsible for:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Maintaining the confidentiality of your login credentials</li>
                    <li>All activity under your account</li>
                    <li>Providing accurate registration information</li>
                  </ul>
                </div>
                <div>
                  <p className="mb-2 font-medium text-foreground">We may suspend or terminate accounts that:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Violate these Terms</li>
                    <li>Engage in harmful or illegal activities</li>
                    <li>Impersonate others</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="text-primary bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0">4</span>
                Acceptable Use Policy
              </h2>
              <div className="pl-10 space-y-2">
                <p>You agree NOT to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Send spam or unsolicited messages</li>
                  <li>Share illegal, harmful, abusive, or explicit content</li>
                  <li>Harass, threaten, or bully other users</li>
                  <li>Upload malware or harmful code</li>
                  <li>Attempt unauthorized access to accounts or systems</li>
                </ul>
                <p className="mt-2 text-primary font-medium">Violation may result in permanent suspension.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="text-primary bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0">5</span>
                Content Ownership
              </h2>
              <div className="pl-10 space-y-2">
                <ul className="list-disc pl-5 space-y-2">
                  <li>You retain ownership of the content you send (messages, images).</li>
                  <li>By using the platform, you grant us a limited license to store and transmit your content solely to operate the service.</li>
                  <li>We do not claim ownership of your personal content.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="text-primary bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0">6</span>
                Image & Media Uploads
              </h2>
              <div className="pl-10 space-y-2">
                <p>When uploading images:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>You confirm you have the right to share them.</li>
                  <li>You agree not to upload illegal or copyrighted material without permission.</li>
                  <li>Images may be processed by third-party storage providers (e.g., cloud storage services).</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="text-primary bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0">7</span>
                Privacy
              </h2>
              <div className="pl-10">
                <p>Your use of Chit-For-Chat is also governed by our Privacy Policy. We collect minimal data necessary to operate the platform.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="text-primary bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0">8</span>
                Service Availability
              </h2>
              <div className="pl-10 space-y-2">
                <p>We do not guarantee:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Uninterrupted service</li>
                  <li>Error-free performance</li>
                  <li>Permanent storage of messages</li>
                </ul>
                <p className="mt-2 text-foreground/80 font-medium">We may perform maintenance or updates at any time.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="text-primary bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0">9</span>
                Limitation of Liability
              </h2>
              <div className="pl-10 space-y-2">
                <p>Chit-For-Chat is provided "as is" without warranties of any kind. We are not responsible for:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>User-generated content</li>
                  <li>Data loss</li>
                  <li>Damages resulting from misuse</li>
                  <li>Third-party service outages</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="text-primary bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0">10</span>
                Termination
              </h2>
              <div className="pl-10">
                <p>We may suspend or terminate your access at our discretion if you violate these Terms. You may stop using the service at any time.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="text-primary bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0">11</span>
                Changes to Terms
              </h2>
              <div className="pl-10">
                <p>We may update these Terms periodically. Continued use of the service after changes means you accept the updated Terms.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="text-primary bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0">12</span>
                Contact Information
              </h2>
              <div className="pl-10 space-y-2">
                <p>For questions regarding these Terms, contact:</p>
                <div className="bg-muted/50 p-4 rounded-xl border border-border/50 space-y-3 mt-4">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-foreground min-w-[70px]">Email:</span>
                    <span className="text-primary break-all">vanshahluwalia29@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-foreground min-w-[70px]">Website:</span>
                    <a href="https://chit-for-chat-client.vercel.app/" className="text-primary hover:underline transition-all break-all">https://chit-for-chat.vercel.app/</a>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShieldIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
    </svg>
  );
}