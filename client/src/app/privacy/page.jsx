import React from 'react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden pt-24 pb-16 lg:pt-32 lg:pb-24">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="bg-card/80 backdrop-blur-xl border border-border p-8 md:p-12 rounded-3xl shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 border border-primary/20">
            <LockIcon className="w-4 h-4" />
            <span>Privacy</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">Privacy Policy</h1>
          <p className="text-sm font-medium text-muted-foreground mb-8 pb-8 border-b border-border/50">Last Updated: 28/02/2026</p>

          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <div className="space-y-4">
              <p className="text-lg">
                Welcome to Chit-For-Chat ("we", "our", or "us"). This Privacy Policy explains how we collect, use, and protect your information when you use our website and messaging platform.
              </p>
              <p className="text-lg">
                By using Chit-For-Chat, you agree to the practices described below.
              </p>
            </div>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="text-primary bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0">1</span>
                Information We Collect
              </h2>
              <div className="pl-10 space-y-6">
                <div>
                  <h3 className="text-foreground font-medium mb-2 flex items-center gap-2">
                    <span className="text-xl">📌</span> A. Information You Provide
                  </h3>
                  <p className="mb-2">When you create an account or use our service, we may collect:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Name</li>
                    <li>Email address</li>
                    <li>Profile picture</li>
                    <li>Messages and images you send</li>
                    <li>Account credentials (encrypted)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-foreground font-medium mb-2 flex items-center gap-2">
                    <span className="text-xl">📌</span> B. Automatically Collected Information
                  </h3>
                  <p className="mb-2">When you use our platform, we may automatically collect:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>IP address</li>
                    <li>Device type</li>
                    <li>Browser type</li>
                    <li>Login timestamps</li>
                    <li>Online/offline status</li>
                    <li>Usage activity</li>
                  </ul>
                  <p className="mt-2 text-foreground/80 font-medium">This helps us improve security and performance.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="text-primary bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0">2</span>
                How We Use Your Information
              </h2>
              <div className="pl-10 space-y-2">
                <p>We use collected data to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Provide and operate the messaging service</li>
                  <li>Authenticate users</li>
                  <li>Enable real-time communication</li>
                  <li>Store chat history</li>
                  <li>Improve performance and security</li>
                  <li>Prevent abuse and fraud</li>
                </ul>
                <p className="mt-2 text-primary font-medium">We do not sell your personal information.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="text-primary bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0">3</span>
                Message & Media Storage
              </h2>
              <div className="pl-10 space-y-2">
                <ul className="list-disc pl-5 space-y-2">
                  <li>Messages and uploaded images are stored securely.</li>
                  <li>Images may be processed through third-party cloud storage providers.</li>
                  <li>We store chat history to allow message retrieval.</li>
                </ul>
                <p className="mt-2 text-foreground/80 font-medium">However, we do not guarantee permanent storage.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="text-primary bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0">4</span>
                Data Security
              </h2>
              <div className="pl-10 space-y-2">
                <p>We implement reasonable security measures, including:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Encrypted password storage</li>
                  <li>Secure server communication (HTTPS)</li>
                  <li>Authentication-based access control</li>
                </ul>
                <p className="mt-2 text-foreground/80 font-medium">Despite this, no online service can guarantee 100% security.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="text-primary bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0">5</span>
                Sharing of Information
              </h2>
              <div className="pl-10 space-y-2">
                <p>We may share information:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>With trusted service providers (e.g., hosting, cloud storage)</li>
                  <li>If required by law</li>
                  <li>To protect users and prevent illegal activity</li>
                </ul>
                <p className="mt-2 text-primary font-medium">We do not share or sell user data for marketing purposes.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="text-primary bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0">6</span>
                Your Rights
              </h2>
              <div className="pl-10 space-y-2">
                <p>You may:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Update your profile information</li>
                  <li>Delete your account (if supported)</li>
                  <li>Contact us to request data removal</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="text-primary bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0">7</span>
                Third-Party Services
              </h2>
              <div className="pl-10 space-y-2">
                <p>Chit-For-Chat may use third-party services such as:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Cloud storage providers</li>
                  <li>Hosting services</li>
                  <li>Database providers</li>
                </ul>
                <p className="mt-2 text-foreground/80 font-medium">These services have their own privacy policies.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="text-primary bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0">8</span>
                Children's Privacy
              </h2>
              <div className="pl-10 space-y-2">
                <p>Chit-For-Chat is not intended for users under 13 years of age.</p>
                <p>We do not knowingly collect data from children under 13.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="text-primary bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0">9</span>
                Changes to This Policy
              </h2>
              <div className="pl-10 space-y-2">
                <p>We may update this Privacy Policy periodically. Changes will be reflected by updating the "Last Updated" date.</p>
                <p>Continued use of the platform means you accept the updated policy.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="text-primary bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0">10</span>
                Contact Us
              </h2>
              <div className="pl-10 space-y-2">
                <p>If you have questions about this Privacy Policy, contact us:</p>
                <div className="bg-muted/50 p-4 rounded-xl border border-border/50 space-y-3 mt-4">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-foreground min-w-[70px]">Email:</span>
                    <span className="text-primary break-all">vanshahluwalia29@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-foreground min-w-[70px]">Website:</span>
                    <a href="https://chit-for-chat.vercel.app/" className="text-primary hover:underline transition-all break-all">https://chit-for-chat.vercel.app/</a>
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

function LockIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  );
}