import React, { useState } from "react";
import {
  FileText,
  FileCheck,
  Target,
  MessageCircle,
  BookOpen,
  TrendingUp,
  Users,
  CheckCircle,
  Award,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Briefcase,
  Globe,
  Zap,
  Shield,
} from "lucide-react";
import logo from "../../assets/logo.png";
import Header from "../layout/Header";
import Footer from "../layout/Footer";

interface LandingPageProps {
  onStartApp: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartApp }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Fonctionnalités principales
  const features = [
    {
      icon: <FileCheck className="h-8 w-8" />,
      title: "Analyse de CV",
      description:
        "Analysez votre CV avec l'intelligence artificielle et obtenez des recommandations personnalisées pour l'améliorer.",
      color: "from-blue-600 to-blue-700",
      bgColor: "blue-700",
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Matching CV-Offre",
      description:
        "Comparez votre CV avec des offres d'emploi et découvrez votre taux de compatibilité en temps réel.",
      color: "from-orange-400 to-orange-500",
      bgColor: "orange-700",
    },
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: "Simulation d'entretien",
      description:
        "Entraînez-vous avec notre DRH IA pour être prêt pour vos entretiens d'embauche.",
      color: "from-blue-600 to-blue-700",
      bgColor: "blue-700",
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Plan de formation",
      description:
        "Recevez des recommandations personnalisées de ressources de formation pour améliorer vos compétences nécessaires.",
      color: "from-orange-400 to-orange-500",
      bgColor: "orange-700",
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Lettre de motivation",
      description:
        "Générez des lettres de motivation personnalisées et adaptées à chaque offre d'emploi avec l'IA.",
      color: "from-blue-600 to-blue-700",
      bgColor: "blue-700",
    },
    {
      icon: <Briefcase className="h-8 w-8" />,
      title: "Plateformes d'offres d'emploi",
      description:
        "Accédez directement aux meilleures plateformes d'offres d'emploi africaines et internationales.",
      color: "from-orange-400 to-orange-500",
      bgColor: "orange-700",
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Suivi des candidatures",
      description:
        "Organisez et suivez toutes vos candidatures dans un dashboard unifié et intuitif.",
      color: "from-blue-600 to-blue-700",
      bgColor: "blue-700",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Mode Hors Ligne",
      description:
        "Accédez à vos données même sans connexion internet pour une utilisation continue.",
      color: "from-orange-400 to-orange-500",
      bgColor: "orange-700",
    },
  ];

  // Bénéfices
  const benefits = [
    {
      icon: <Users className="h-8 w-8" />,
      title: "Accessible à tous",
      description:
        "Pensé pour les jeunes talents africains, sans barrière d'entrée ni frais cachés.",
      color: "from-blue-700 to-blue-800",
      bgColor: "bg-blue-50",
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Accompagnement IA",
      description:
        "Utilise l'IA pour des analyses précises et des recommandations pertinentes.",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Contexte Africain",
      description:
        "Adapté aux spécificités du marché de l'emploi africain et aux secteurs locaux.",
      color: "from-blue-700 to-blue-800",
      bgColor: "bg-blue-50",
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "100% Confidentiel",
      description:
        "Vos données sont protégées et jamais partagées sans votre accord.",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  // Statistiques
  const stats = [
    { number: "50+", label: "Utilisateurs" },
    { number: "100+", label: "CV analysés" },
    { number: "5+", label: "Outils IA" },
    { number: "5+", label: "Partenaires" },
  ];

  // FAQ
  const faqs = [
    {
      question: "Comment puis-je améliorer mon CV avec CvMentor AI ?",
      answer:
        "Téléversez votre CV et recevez une analyse détaillée avec des conseils personnalisés, des suggestions de mots-clés et des axes d'amélioration adaptés à votre profil.",
    },
    {
      question: "Puis-je comparer mon CV à plusieurs offres ?",
      answer:
        "Oui, vous pouvez comparer votre CV à autant d'offres d'emploi que vous le souhaitez pour identifier vos points forts et vos axes d'amélioration pour chaque poste.",
    },
    {
      question: "Les analyses sont-elles adaptées à mon secteur ?",
      answer:
        "Oui, l'IA adapte ses conseils et analyses en fonction du secteur d'activité et du poste visé pour une personnalisation maximale.",
    },
    {
      question: "Mes données sont-elles sécurisées ?",
      answer:
        "Absolument. Vos données sont stockées localement sur votre appareil et ne sont jamais partagées avec des tiers sans votre consentement. Vous pouvez également les supprimer à tout moment depuis votre espace personnel.",
    },
    {
      question: "L'IA fonctionne-t-elle hors ligne ?",
      answer:
        "Oui ! CvMentor AI fonctionne en mode hors ligne pour la plupart des fonctionnalités. Vos données sont synchronisées une fois la connexion rétablie.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* En tête */}
      <Header />

      {/* Hero Section */}
      <section
        id="hero"
        className="relative overflow-hidden pt-20 bg-gradient-to-br from-white via-blue-100/60 to-blue-200/40"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, rgba(249, 115, 22, 0.3) 0%, transparent 50%)`,
            }}
          ></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-8">
          <div className="text-center">
            {/* Logo avec animation */}
            <div className="mb-4">
              <div className="flex justify-center">
                <div className="group cursor-pointer transform hover:scale-105 transition-all duration-300">
                  <img
                    src={logo}
                    alt="CvMentor AI Logo"
                    className="w-24 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-30 object-contain drop-shadow-lg"
                  />
                </div>
              </div>

              {/* Nom de la plateforme */}
              <div className="mt-2">
                <h1
                  className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-bold group-hover:scale-105 transition-all duration-300"
                  translate="no"
                >
                  <span className="text-orange-500">C</span>
                  <span className="text-blue-700">v</span>
                  <span className="text-orange-500">Mentor</span>
                  <span className="text-blue-700"> AI</span>
                </h1>
              </div>

              {/* Slogan */}
              <div className="mt-2">
                <p className="text-base sm:text-lg md:text-xl font-semibold text-gray-600">
                  Optimisez votre candidature !
                </p>
              </div>
            </div>

            {/* Titre accrocheur avec design moderne */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              L'outil qui révolutionne votre recherche d'emploi en Afrique
              {/* Passez de candidature ignorée à profil recherché */}
            </h2>

            {/* Sous-titre */}
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 max-w-4xl mx-auto">
              Mettez toutes les chances de votre côté avec un accompagnement
              complet : CV, Lettre de motivation, offres ciblées, préparation
              aux entretiens et recommandations pour progresser.
              {/* Optimisez votre CV, préparez vos entretiens et développez vos compétences avec l'intelligence artificielle adaptée au contexte africain. */}
            </p>

            {/* Call-to-action principal inspiré d'AIApply */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <button
                // onClick={onStartApp}
                className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3"
              >
                Commencer gratuitement
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section stats + video illustration responsive */}
      <section className="w-full py-6 lg:py-10 flex flex-col md:flex-row gap-10 items-center justify-center px-2 sm:px-4 lg:px-14 bg-gradient-to-br from-blue-50 via-white to-orange-50/40">
        {/* Bloc stats */}
        <div className="w-full md:w-3/6 flex justify-center grid grid-cols-2 gap-4 md:grid-cols-4 max-w-3xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-lg border border-white/20"
            >
              <div className="text-md md:text-xl font-bold text-gray-900 mb-1">
                {stat.number}
              </div>
              <div className="text-2xs text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        {/* Bloc vidéo */}
        <div className="w-full md:w-3/6 flex justify-center">
          <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-white/90">
            <div className="relative pb-[56.25%] h-0">
              <iframe
                className="absolute top-0 left-0 w-full h-full rounded-2xl"
                src="https://www.youtube.com/embed/SEIDyEpFoas?si=H7-Vafh3j09ZI2fx"
                title="Présentation CvMentor AI"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Section Fonctionnalités */}
      <section
        id="features"
        className="py-8 lg:py-12 bg-gradient-to-br from-orange-50 via-white to-blue-50 border-b border-orange-100"
      >
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Tout ce dont vous avez besoin pour réussir
            </h2>
            <p className="text-xl text-gray-600 md:text-2xl mx-auto">
              Des outils intelligents conçus pour booster votre carrière et
              répondre aux réalités du marché africain
            </p>
          </div>

          {/* Fonctionnalités principales */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-md hover:shadow-2xl transition-all duration-500 border border-${feature.bgColor} hover:border-white/80 overflow-hidden transform hover:-translate-y-2`}
              >
                {/* Background gradient overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color
                    .replace("from-", "from-")
                    .replace(
                      "to-",
                      "to-"
                    )} opacity-5 group-hover:opacity-100 transition-opacity duration-600`}
                ></div>

                {/* Icon container with modern design */}
                <div className="relative z-10 mb-4">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white shadow-md group-hover:shadow-xl group-hover:scale-105 transition-all duration-600 ring-4 ring-white/20 group-hover:ring-white/40`}
                  >
                    {feature.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h3
                    className={`text-${feature.bgColor} text-md font-bold mb-2 group-hover:text-white transition-colors`}
                    translate="no"
                  >
                    {feature.title}
                  </h3>
                  <h4
                    className={`text-${feature.bgColor} text-sm group-hover:text-white transition-colors`}
                    translate="no"
                  >
                    {feature.description}
                  </h4>
                </div>

                {/* Hover effect indicator */}
                <div
                  className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Proposition de Valeur */}
      <section
        id="value"
        className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-800 py-8 sm:py-8 lg:py-12 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, rgba(249, 115, 22, 0.3) 0%, transparent 50%)`,
            }}
          ></div>
        </div>

        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-4 relative z-10">
          <div className="text-center mb-5 sm:mb-8 lg:mb-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3 lg:mb-4">
              Pourquoi choisir CvMentor AI ?
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-5xl mx-auto px-2">
              Une plateforme pensée pour vous accompagner à chaque étape de
              votre parcours professionnel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className={[
                  // Remove card look on desktop, add dividers
                  "flex flex-col items-center text-center py-5 px-4",
                  "bg-transparent",
                  "transition-all duration-300",
                  // Vertical divider for desktop except last
                  index < benefits.length - 1
                    ? "lg:border-r lg:border-white/30"
                    : "",
                  // Horizontal divider for mobile except last
                  index < benefits.length - 1
                    ? "border-b border-white/20 lg:border-b-0"
                    : "",
                ].join(" ")}
              >
                {/* Icon container */}
                <div className="mb-3 flex justify-center">
                  <div className="w-14 h-14 rounded-lg bg-white flex items-center justify-center text-orange-500 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                    {React.cloneElement(benefit.icon, {
                      className: "w-8 h-8",
                    })}
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                    {benefit.title}
                  </h3>
                  <p className="text-white text-sm">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Decorative SVGs */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <svg
            className="absolute left-0 top-0 w-40 h-40 opacity-10"
            viewBox="0 0 200 200"
            fill="none"
          >
            <circle cx="100" cy="100" r="100" fill="#fff" />
          </svg>
          <svg
            className="absolute right-0 top-10 w-32 h-32 opacity-10"
            viewBox="0 0 160 160"
            fill="none"
          >
            <circle cx="80" cy="80" r="80" fill="#fff" />
          </svg>
        </div>
      </section>

      {/* À propos de nous */}
      <section
        id="about"
        className="py-8 lg:py-12 bg-gradient-to-br from-blue-50 via-white to-orange-50 border-t border-b border-blue-100"
      >
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">
              À propos de nous
            </h2>
            <p className="text-lg text-gray-600 max-w-5xl mx-auto">
              CvMentor AI est un projet né d'une envie simple : aider chacun à
              mieux se préparer au monde du travail. Face aux difficultés
              d'accès à l'emploi, au manque de conseils personnalisés et à la
              complexité du marché, nous avons créé une plateforme accessible,
              intelligente et adaptée au contexte local. Notre objectif est de
              donner à tous les candidats les bons outils pour optimiser leurs
              chances de décrocher un emploi, progresser dans leur carrière et
              gagner en confiance.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow p-4 flex flex-col items-center text-center border border-blue-100">
              <BarChart3 className="h-10 w-10 text-orange-500 mb-3" />
              <h3 className="font-bold text-blue-800 mb-2">Notre Vision</h3>
              <p className="text-gray-600 text-md">
                Aider chacun à mieux se préparer au monde du travail en donnant
                les bons outils pour comprendre les attentes des recruteurs,
                améliorer son CV, et décrocher plus facilement un emploi.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow p-4 flex flex-col items-center text-center border border-blue-100">
              <CheckCircle className="h-10 w-10 text-blue-600 mb-3" />
              <h3 className="font-bold text-blue-800 mb-2">Nos Valeurs</h3>
              <p className="text-gray-600 text-md">
                Confidentialité, impact social et inclusion sont au cœur de
                notre approche. Nous utilisons la technologie pour créer des
                solutions utiles, concrètes et pensées pour répondre aux vrais
                besoins des chercheurs d'emploi en Afrique.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow p-4 flex flex-col items-center text-center border border-blue-100">
              <Users className="h-10 w-10 text-orange-500 mb-3" />
              <h3 className="font-bold text-blue-800 mb-2">Notre Équipe</h3>
              <p className="text-gray-600 text-md">
                Nous sommes une équipe motivée, composée de passionnés de
                technologie et d'éducation, qui connaissent les réalités du
                terrain et veulent faciliter l'accès à l'emploi grâce à des
                solutions concrètes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className="py-8 lg:py-12 bg-gradient-to-br from-orange-50 via-white to-blue-50 border-b border-orange-100"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Questions fréquentes
            </h2>
            <p className="text-xl text-gray-600">
              Tout ce que vous devez savoir sur CvMentor AI
            </p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-xl border border-gray-100 bg-white/80 flex flex-col overflow-hidden shadow-none"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left group focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="block w-1.5 h-7 rounded bg-blue-600 mr-3"
                      aria-hidden="true"
                    ></span>
                    <span className="font-semibold text-gray-900 text-base group-hover:text-orange-500 transition-colors">
                      {faq.question}
                    </span>
                  </span>
                  <span className="ml-2">
                    {openFaq === index ? (
                      <ChevronUp className="h-5 w-5 text-orange-400 transition-transform duration-200 rotate-180" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-orange-400 transition-colors" />
                    )}
                  </span>
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    openFaq === index
                      ? "max-h-40 opacity-100 py-2 px-7"
                      : "max-h-0 opacity-0 py-0 px-7"
                  } overflow-hidden bg-white/90`}
                  style={{}}
                >
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call-to-Action - Design Minimaliste */}
      <section
        id="cta"
        className="bg-gradient-to-br from-blue-50 via-orange-50 to-white py-10 lg:py-12 border-b border-blue-100"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Titre simple et impactant */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Prêt à <span className="text-orange-500">commencer</span> ?
          </h2>

          {/* Description courte */}
          <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto">
            Rejoignez des milliers d'utilisateurs qui ont déjà transformé leur
            carrière
          </p>

          {/* Bouton principal unique */}
          <button
            onClick={onStartApp}
            className="group bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-xl font-bold text-md shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto"
          >
            <span>Commencer gratuitement</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Pied de page */}
      <Footer />
    </div>
  );
};

export default LandingPage;
