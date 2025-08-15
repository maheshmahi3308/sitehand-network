import Header from "@/components/Header";
import Hero from "@/components/Hero";
import UserTypes from "@/components/UserTypes";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <UserTypes />
        <Features />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
