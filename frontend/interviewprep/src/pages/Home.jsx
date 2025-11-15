import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { Player } from "@lottiefiles/react-lottie-player";
import Navbar from "@/components/Navbar";

export default function HomePage() {
  return (
    <>
     
    <div className="w-full min-h-screen bg-gradient-to-b from-white to-purple-50 text-gray-900">
 <Navbar/>

      {/* Section 1: Hero */}
      <section id="home" className="h-screen flex flex-col justify-center items-center text-center px-6 bg-gradient-to-br from-purple-800 via-indigo-900 to-purple-900 text-white">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-6xl font-extrabold tracking-wide bg-gradient-to-r from-purple-300 to-pink-400 bg-clip-text text-transparent"
        >
          InterviewPrep AI
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="mt-6 text-lg max-w-2xl opacity-90"
        >
          Level up your interview skills with AI-powered practice, insights, and reports.
        </motion.p>

        {/* Lottie Illustration */}
        <Player
          autoplay
          loop
          src="https://assets3.lottiefiles.com/packages/lf20_jcikwtux.json"
          className="w-72 h-72 mt-8"
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="mt-10"
        >
          <Button
  asChild
  className="bg-purple-500 hover:bg-purple-600 px-6 py-3 rounded-xl text-lg"
>
  <a href="#take-test">
    Get Started <ArrowRight className="ml-2" />
  </a>
</Button>
        </motion.div>
      </section>

      {/* Section 2: Take Test */}
      <section id="take-test" className="py-24 bg-gradient-to-b from-purple-50 to-white px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-10 text-purple-700">Take Your Skill Test</h2>
          <div className="grid md:grid-cols-2 gap-10">
            {/* Lottie on Side */}
            <div className="hidden md:flex justify-center items-center">
              <Player
                autoplay
                loop
                src="https://assets4.lottiefiles.com/packages/lf20_tno6cg2w.json"
                className="w-80 h-80"
              />
            </div>
           <Card className="bg-white border border-purple-200 shadow-md">
  <CardContent className="p-6 flex flex-col items-center text-center">
    <h3 className="text-2xl font-semibold text-purple-600">
      Technical Interview Simulation
    </h3>

    <p className="mt-3 text-gray-600 text-sm max-w-xs">
      AI asks real interview-style questions based on your role.
    </p>

 <Button
  className="
    mt-6 
    bg-purple-600 
    hover:bg-purple-700 
    text-white 
    font-bold 
    text-xl 
    py-6        /* increased height */
    px-12 
    rounded-2xl 
    shadow-xl 
    hover:shadow-purple-400/40 
    transition-all 
    duration-300 
    hover:scale-105
  "
>
  Start Test
</Button>
  </CardContent>
</Card>


          </div>
        </div>
      </section>

      {/* Section 3: Reports */}
      <section id="reports" className="py-24 bg-gradient-to-b from-white to-purple-50 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-purple-700 mb-6">View Your Reports</h2>
          <Player
            autoplay
            loop
            src="https://assets1.lottiefiles.com/private_files/lf30_jmgekfqg.json"
            className="w-56 h-56 mx-auto mb-10"
          />
          <p className="max-w-3xl mx-auto text-gray-700 mb-12">
            Deep insights into correctness, clarity, confidence, and improvement areas.
          </p>
          <Button className="bg-purple-600 hover:bg-purple-700 text-lg px-6 py-3 rounded-xl text-white">
            View Report
          </Button>
        </div>
      </section>

      {/* Section 4: Why Choose Us */}
      <section id="about-us" className="py-24 bg-gradient-to-b from-purple-50 to-white px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-purple-700 mb-12">Why Choose InterviewPrep AI?</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { title: "AI-Powered Analysis", text: "Instant evaluation with correctness & clarity scoring." },
              { title: "Real Interview Feel", text: "Role-based interview questions dynamically generated." },
              { title: "Smart Growth Tracking", text: "Track your performance across multiple sessions." }
            ].map((item, i) => (
              <Card key={i} className="bg-white border border-purple-200 shadow-xl">
                <CardContent className="p-6 text-center">
                  <h3 className="text-2xl font-semibold text-purple-600">{item.title}</h3>
                  <p className="mt-3 text-gray-600 text-sm">{item.text}</p>
                </CardContent>
              </Card>
            ))}


          </div>
        </div>
      </section>
{/* Footer */}
<footer id="contact" className="bg-gradient-to-b from-purple-900 to-purple-800 text-white py-24 mt-20">
  <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10">

    {/* Brand */}
    <div>
      <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
        InterviewPrep AI
      </h3>
      <p className="text-gray-300 mt-3 text-sm">
        Practice smarter with AI-driven interviews, insights, and performance tracking.
      </p>
    </div>

    {/* Contact Us */}
    <div>
      <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
      <p className="text-gray-300 text-sm mb-2">📧 Email: support@interviewprep.ai</p>
      <p className="text-gray-300 text-sm mb-2">📞 Phone: +91 98765 43210</p>
      <p className="text-gray-300 text-sm">🌐 Website: www.interviewprep.ai</p>
    </div>

    {/* Quick Links */}
    <div>
      <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
      <ul className="space-y-2">
        <li><a href="#" className="text-gray-300 hover:text-white transition">Take Test</a></li>
        <li><a href="#" className="text-gray-300 hover:text-white transition">Reports</a></li>
        <li><a href="#" className="text-gray-300 hover:text-white transition">About Us</a></li>
        <li><a href="#" className="text-gray-300 hover:text-white transition">Support</a></li>
      </ul>
    </div>
  </div>
  <button
  className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white 
  w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-xl font-bold"
>
  💬
</button>


  {/* Bottom Line */}
  <div className="text-center text-gray-400 text-sm mt-10 border-t border-purple-700/40 pt-6">
    © {new Date().getFullYear()} InterviewPrep AI. All rights reserved.
  </div>
</footer>
      
    </div>
      </>
  );

}
