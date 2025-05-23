"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { ThemeImage } from "../theme-image";

export function LandingTabs() {
  // Define three tab types
  type TabType = "experience" | "timeline" | "dashboard";

  const [activeTab, setActiveTab] = useState<TabType>("experience");
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [animationProgress, setAnimationProgress] = useState(0);
  const { theme } = useTheme();

  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Tab content
  const tabContent = {
    experience: {
      title: "Teoria",
      description:
        "Tutti gli argomenti di matematica spiegati in modo chiaro e organizzato: categorie, formule, grafici, immagini ed esercizi collegati.",
      lightImage:
        "https://yrnoofgubhnghwauieil.supabase.co/storage/v1/object/sign/landing-light/teoria.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzBmM2JjYjBiLWU5NDgtNDY0Ny04ZGEyLWM0NjZlMTVkMzVlYiJ9.eyJ1cmwiOiJsYW5kaW5nLWxpZ2h0L3Rlb3JpYS5wbmciLCJpYXQiOjE3NDY3NDQ0MDksImV4cCI6MjA2MjEwNDQwOX0.ojVJA-SGWsQLQ-7zswND4EBZLyCsR_TgRtzR03BbweE",
      darkImage:
        "https://yrnoofgubhnghwauieil.supabase.co/storage/v1/object/sign/landing/teoria.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzBmM2JjYjBiLWU5NDgtNDY0Ny04ZGEyLWM0NjZlMTVkMzVlYiJ9.eyJ1cmwiOiJsYW5kaW5nL3Rlb3JpYS5wbmciLCJpYXQiOjE3NDY3NDQ5NTcsImV4cCI6MjA2MjEwNDk1N30.eZlpPsC5LPbwbekXRoqEPlSYiyznT2WpUDbuOMeX3qI",
      mobileLightImage:
        "https://yrnoofgubhnghwauieil.supabase.co/storage/v1/object/sign/landing-light/teoria-mobile.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzBmM2JjYjBiLWU5NDgtNDY0Ny04ZGEyLWM0NjZlMTVkMzVlYiJ9.eyJ1cmwiOiJsYW5kaW5nLWxpZ2h0L3Rlb3JpYS1tb2JpbGUucG5nIiwiaWF0IjoxNzQ2NzQ1NDU2LCJleHAiOjE3NzgyODE0NTZ9.GaR-3OnDWJIsmuiIxQM6d467qFCCw9FYL_LqZItKNas",
      mobileDarkImage:
        "https://yrnoofgubhnghwauieil.supabase.co/storage/v1/object/sign/landing/teoria-mobile.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzBmM2JjYjBiLWU5NDgtNDY0Ny04ZGEyLWM0NjZlMTVkMzVlYiJ9.eyJ1cmwiOiJsYW5kaW5nL3Rlb3JpYS1tb2JpbGUucG5nIiwiaWF0IjoxNzQ2NzQ1NDg4LCJleHAiOjE3NzgyODE0ODh9.gDEwniHyXKCG2IO3jE02TMsnIN1Hy9eYNyCaq6WU1ro",
    },
    timeline: {
      title: "Esercizi",
      description:
        "Una raccolta completa di esercizi per ogni argomento, divisi per livello di difficoltà, e con la possibilità di fare domande all'AI.",
      lightImage:
        "https://yrnoofgubhnghwauieil.supabase.co/storage/v1/object/sign/landing-light/esercizi.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzBmM2JjYjBiLWU5NDgtNDY0Ny04ZGEyLWM0NjZlMTVkMzVlYiJ9.eyJ1cmwiOiJsYW5kaW5nLWxpZ2h0L2VzZXJjaXppLnBuZyIsImlhdCI6MTc0Njc0NDQyNSwiZXhwIjoyMDYyMTA0NDI1fQ.EV6Hhi65bjVjrwmheO7d70epM4d_zwNBOjMUrAk29E4",
      darkImage:
        "https://yrnoofgubhnghwauieil.supabase.co/storage/v1/object/sign/landing/esercizi.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzBmM2JjYjBiLWU5NDgtNDY0Ny04ZGEyLWM0NjZlMTVkMzVlYiJ9.eyJ1cmwiOiJsYW5kaW5nL2VzZXJjaXppLnBuZyIsImlhdCI6MTc0Njc0NDk4MywiZXhwIjoyMDYyMTA0OTgzfQ.dZGx8PbnR3LZTCaesFiUS7x4xH3gb8EmtYBbeYw7mnU",
      mobileLightImage:
        "https://yrnoofgubhnghwauieil.supabase.co/storage/v1/object/sign/landing-light/esercizi-mobile.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzBmM2JjYjBiLWU5NDgtNDY0Ny04ZGEyLWM0NjZlMTVkMzVlYiJ9.eyJ1cmwiOiJsYW5kaW5nLWxpZ2h0L2VzZXJjaXppLW1vYmlsZS5wbmciLCJpYXQiOjE3NDY3NDU0NzAsImV4cCI6MTc3ODI4MTQ3MH0.NKZ4Zzins8RYRMmw_RIePB_fqZIUtLJZF_LPZXbX0QU",
      mobileDarkImage:
        "https://yrnoofgubhnghwauieil.supabase.co/storage/v1/object/sign/landing/esercizi-mobile.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzBmM2JjYjBiLWU5NDgtNDY0Ny04ZGEyLWM0NjZlMTVkMzVlYiJ9.eyJ1cmwiOiJsYW5kaW5nL2VzZXJjaXppLW1vYmlsZS5wbmciLCJpYXQiOjE3NDY3NDU1NDEsImV4cCI6MTc3ODI4MTU0MX0.EySMCwYQ7yP8JGACbNfitp2R-ZOG8XmhP9kKMKnemrY",
    },
    dashboard: {
      title: "Simulazioni",
      description:
        "Tutte le simulazioni d'esame ufficiali degli anni passati, pronte da svolgere per allenarti come se fossi il giorno della maturità.",
      lightImage:
        "https://yrnoofgubhnghwauieil.supabase.co/storage/v1/object/sign/landing-light/simulazione.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzBmM2JjYjBiLWU5NDgtNDY0Ny04ZGEyLWM0NjZlMTVkMzVlYiJ9.eyJ1cmwiOiJsYW5kaW5nLWxpZ2h0L3NpbXVsYXppb25lLnBuZyIsImlhdCI6MTc0Njc0NDQzMywiZXhwIjoyMDYyMTA0NDMzfQ.LPxUxal2R6KBTN43bD-DThd9azNF79ARJZM3LAAtFY0",
      darkImage:
        "https://yrnoofgubhnghwauieil.supabase.co/storage/v1/object/sign/landing/simulazione.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzBmM2JjYjBiLWU5NDgtNDY0Ny04ZGEyLWM0NjZlMTVkMzVlYiJ9.eyJ1cmwiOiJsYW5kaW5nL3NpbXVsYXppb25lLnBuZyIsImlhdCI6MTc0Njc0NDk5MywiZXhwIjoyMDYyMTA0OTkzfQ.xM_UhaDIQvYP4jFkOLbN9XZXSY0SH8qxI4cM0XFJaI8",
      mobileLightImage:
        "https://yrnoofgubhnghwauieil.supabase.co/storage/v1/object/sign/landing-light/simulazione-mobile.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzBmM2JjYjBiLWU5NDgtNDY0Ny04ZGEyLWM0NjZlMTVkMzVlYiJ9.eyJ1cmwiOiJsYW5kaW5nLWxpZ2h0L3NpbXVsYXppb25lLW1vYmlsZS5wbmciLCJpYXQiOjE3NDY3NDU0ODAsImV4cCI6MTc3ODI4MTQ4MH0._rd4jRZTB_Qm5HcgNI_dbQX0HZiX5w6EeWKM_L-mkvU",
      mobileDarkImage:
        "https://yrnoofgubhnghwauieil.supabase.co/storage/v1/object/sign/landing/simulazione-mobile.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzBmM2JjYjBiLWU5NDgtNDY0Ny04ZGEyLWM0NjZlMTVkMzVlYiJ9.eyJ1cmwiOiJsYW5kaW5nL3NpbXVsYXppb25lLW1vYmlsZS5wbmciLCJpYXQiOjE3NDY3NDU1MDQsImV4cCI6MTc3ODI4MTUwNH0.jgoc3AbqaRxlz8CmejrB1SItYaTFkMIPeKp9zCITOFk",
    },
  };

  // Get the tab order for positioning and next tab selection
  const tabOrder: TabType[] = ["experience", "timeline", "dashboard"];

  // Get the tab index (0, 1, or 2)
  const getTabIndex = (tab: TabType): number => tabOrder.indexOf(tab);

  // Get the next tab in sequence
  const getNextTab = (currentTab: TabType): TabType => {
    const currentIndex = getTabIndex(currentTab);
    const nextIndex = (currentIndex + 1) % tabOrder.length;
    return tabOrder[nextIndex];
  };

  // Controls the animation of the progress bar
  const startProgressAnimation = (nextTab: TabType) => {
    // Clear existing animation
    if (progressRef.current) clearInterval(progressRef.current);

    let progress = 0;
    setAnimationProgress(0);

    // Create a new interval to animate the progress
    progressRef.current = setInterval(() => {
      progress += 1;
      setAnimationProgress(progress);

      // When progress is complete, move to next tab
      if (progress >= 100) {
        clearInterval(progressRef.current!);
        setActiveTab(nextTab);
        setAnimationProgress(0);

        // Restart auto-scroll if enabled
        if (isAutoScrolling) {
          setTimeout(() => {
            startProgressAnimation(getNextTab(nextTab));
          }, 500); // Small pause between tabs
        }
      }
    }, 30); // Update more frequently for smoother animation
  };

  // Handle tab selection by user
  const handleTabClick = (tab: TabType) => {
    // Stop any running animations
    if (progressRef.current) clearInterval(progressRef.current);
    if (autoScrollRef.current) clearTimeout(autoScrollRef.current);
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);

    // Update state
    setActiveTab(tab);
    setAnimationProgress(0);
    setIsAutoScrolling(false);

    // Set a timeout to resume auto-scrolling after 5 seconds of inactivity
    resumeTimeoutRef.current = setTimeout(() => {
      setIsAutoScrolling(true);
    }, 5000);
  };

  // Watch for changes to isAutoScrolling state and restart animation when it becomes true
  useEffect(() => {
    if (isAutoScrolling && !progressRef.current) {
      const nextTab = getNextTab(activeTab);

      const timer = setTimeout(() => {
        startProgressAnimation(nextTab);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [isAutoScrolling, activeTab]);

  // Initial setup of auto-scrolling (only runs on mount)
  useEffect(() => {
    // Start auto-scrolling after initial delay
    const initialTimer = setTimeout(() => {
      if (isAutoScrolling) {
        const nextTab = getNextTab(activeTab);
        startProgressAnimation(nextTab);
      }
    }, 1000);

    // Force restart auto-scrolling every 30 seconds in case it gets stuck
    const forceRestartInterval = setInterval(() => {
      if (progressRef.current === null) {
        setIsAutoScrolling(true);
      }
    }, 30000);

    // Cleanup on unmount
    return () => {
      clearTimeout(initialTimer);
      if (autoScrollRef.current) clearTimeout(autoScrollRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
      clearInterval(forceRestartInterval);
    };
  }, []);

  // Calculate the current position and width of the progress indicator
  const calculateProgressStyle = () => {
    const tabWidth = 100 / tabOrder.length; // Width of each tab as percentage
    const currentTabIndex = getTabIndex(activeTab);

    // Base position is at the start of the current tab
    const basePosition = currentTabIndex * tabWidth;

    // Calculate how far across the tab the indicator should be
    const progressWidth = (animationProgress / 100) * tabWidth;

    return {
      left: `${basePosition}%`,
      width: `${progressWidth}%`,
    };
  };

  return (
    <div
      id="features"
      className="max-w-7xl w-full mx-auto flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8"
    >
      {/* Improved title and subtitle styling */}
      <h1 className="w-full text-center text-3xl font-bold tracking-tight text-foreground mb-6 sm:text-4xl md:text-5xl md:leading-tight">
        Troppi appunti, troppi siti, troppe perdite di tempo.{" "}
        {/* <span className="text-primary">non è semplice.</span> */}
      </h1>
      <p className="text-center max-w-3xl text-lg text-muted-foreground mb-12">
        Tra mille materiali diversi è facile perdersi e sprecare tempo.
        MaturaMate ti dà un percorso chiaro: tutto quello che ti serve, in un
        unico posto.
      </p>

      <div className="w-full flex flex-col gap-8">
        {/* Content display area */}
        <div className="bg-white dark:bg-neutral-900 rounded-lg overflow-hidden shadow-xl min-h-[400px]">
          <div className="h-full w-full p-6">
            {/* Display content based on active tab */}
            <div className="h-full bg-gray-50 dark:bg-neutral-800 rounded-lg w-full flex items-center justify-center overflow-hidden transition-all duration-300 ease-in-out p-4">
              {activeTab === "experience" && (
                <ThemeImage
                  lightImage={tabContent.experience.lightImage}
                  darkImage={tabContent.experience.darkImage}
                  mobileLightImage={tabContent.experience.mobileLightImage}
                  mobileDarkImage={tabContent.experience.mobileDarkImage}
                  alt={tabContent.experience.title}
                  className="w-full h-full object-contain rounded-md shadow-lg transition-transform duration-300 hover:scale-[1.02]"
                  mobileBreakpoint={768}
                />
              )}
              {activeTab === "timeline" && (
                <ThemeImage
                  lightImage={tabContent.timeline.lightImage}
                  darkImage={tabContent.timeline.darkImage}
                  mobileLightImage={tabContent.timeline.mobileLightImage}
                  mobileDarkImage={tabContent.timeline.mobileDarkImage}
                  alt={tabContent.timeline.title}
                  className="w-full h-full object-contain rounded-md shadow-lg transition-transform duration-300 hover:scale-[1.02]"
                  mobileBreakpoint={768}
                />
              )}
              {activeTab === "dashboard" && (
                <ThemeImage
                  lightImage={tabContent.dashboard.lightImage}
                  darkImage={tabContent.dashboard.darkImage}
                  mobileLightImage={tabContent.dashboard.mobileLightImage}
                  mobileDarkImage={tabContent.dashboard.mobileDarkImage}
                  alt={tabContent.dashboard.title}
                  className="w-full h-full object-contain rounded-md shadow-lg transition-transform duration-300 hover:scale-[1.02]"
                  mobileBreakpoint={768}
                />
              )}
            </div>
          </div>
        </div>

        {/* Tab component with animation */}
        <div ref={tabsContainerRef} className="relative w-full">
          {/* Unified border across all tabs - only visible on desktop */}
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-200 dark:bg-neutral-700 overflow-hidden hidden md:block">
            {/* Animated progress indicator */}
            <div
              className="absolute top-0 h-full bg-primary transition-all duration-300 ease-out"
              style={calculateProgressStyle()}
            />
          </div>

          {/* Tab buttons container - no gaps */}
          <div className="grid grid-cols-1 md:grid-cols-3 w-full md:border-t md:border-gray-100 dark:md:border-neutral-800">
            {/* Experience Tab */}
            <button
              onClick={() => handleTabClick("experience")}
              className={`relative text-left p-6 transition-all duration-300 focus:outline-none md:border-r border-t md:border-t-0 border-gray-100 dark:border-neutral-800 ${
                activeTab === "experience"
                  ? "bg-gray-50 dark:bg-neutral-800"
                  : ""
              }`}
            >
              {/* Mobile progress indicator - only visible on mobile */}
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-200 dark:bg-neutral-700 md:hidden">
                {activeTab === "experience" && (
                  <div
                    className="absolute top-0 h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${animationProgress}%` }}
                  />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <h3
                  className={`font-medium text-xl ${
                    activeTab === "experience"
                      ? "text-primary"
                      : "text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {tabContent.experience.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {tabContent.experience.description}
                </p>
              </div>
            </button>

            {/* Timeline Tab */}
            <button
              onClick={() => handleTabClick("timeline")}
              className={`relative text-left p-6 transition-all duration-300 focus:outline-none md:border-r border-t md:border-t-0 border-gray-100 dark:border-neutral-800 ${
                activeTab === "timeline" ? "bg-gray-50 dark:bg-neutral-800" : ""
              }`}
            >
              {/* Mobile progress indicator - only visible on mobile */}
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-200 dark:bg-neutral-700 md:hidden">
                {activeTab === "timeline" && (
                  <div
                    className="absolute top-0 h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${animationProgress}%` }}
                  />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <h3
                  className={`font-medium text-xl ${
                    activeTab === "timeline"
                      ? "text-primary"
                      : "text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {tabContent.timeline.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {tabContent.timeline.description}
                </p>
              </div>
            </button>

            {/* Dashboard Tab */}
            <button
              onClick={() => handleTabClick("dashboard")}
              className={`relative text-left p-6 transition-all duration-300 focus:outline-none border-t md:border-t-0 border-gray-100 dark:border-neutral-800 ${
                activeTab === "dashboard"
                  ? "bg-gray-50 dark:bg-neutral-800"
                  : ""
              }`}
            >
              {/* Mobile progress indicator - only visible on mobile */}
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-200 dark:bg-neutral-700 md:hidden">
                {activeTab === "dashboard" && (
                  <div
                    className="absolute top-0 h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${animationProgress}%` }}
                  />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <h3
                  className={`font-medium text-xl ${
                    activeTab === "dashboard"
                      ? "text-primary"
                      : "text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {tabContent.dashboard.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {tabContent.dashboard.description}
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
