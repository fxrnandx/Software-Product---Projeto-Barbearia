import CssBaseline from "@mui/material/CssBaseline";
import "./globals.css";
import { Roboto } from "next/font/google";
import LinearProgress from "@mui/material/LinearProgress";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import React from "react";
import { NextAppProvider } from "@toolpad/core/nextjs";
import { Branding, Navigation } from "@toolpad/core/AppProvider";
import Header from "@/components/Header";
import { auth } from "@/utils/auth";
import { SessionProvider, signIn, signOut } from 'next-auth/react';
import Image from "next/image";
import HomeIcon from '@mui/icons-material/Home';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PersonIcon from '@mui/icons-material/Person';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import BarChartIcon from '@mui/icons-material/BarChart';
import { LocationProvider } from "@/providers/Locationprovider";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

const BRANDING: Branding = {
  title: "Barber Shop",
  logo: <Image src='/vercel.svg' alt="Logo" width={25} height={25} />,
};

const NAVIGATION: Navigation = [
  {
    title: "Home",
    icon: <HomeIcon />
  },
  {
    segment: "admin",
    title: "Create",
    icon: <AddCircleIcon />,
    children: [
      {
        segment: "shop",
        title: "Your Shops",
        pattern: "shop{/:shopId}*",
        icon: <AddCircleIcon />,
      },
      {
        segment: "employees",
        title: "Your Shops Employees",
        pattern: "employees{/:employeeId}*",
        icon: <PersonIcon />,
      },
      {
        segment: "services",
        title: "Your Shops Services",
        pattern: "services{/:serviceId}*",
        icon: <HomeRepairServiceIcon />,
      }
    ]
  },
  {
    segment: "reports",
    title: "Reports",
    pattern: "reports",
    icon: <BarChartIcon />,
  }
];

const AUTHENTICATION = {
  signIn,
  signOut,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html
      lang="en"
      className={roboto.variable}
      data-toolpad-color-scheme="dark"
    >
      <body>
        <SessionProvider session={session}>
          <LocationProvider>
          <AppRouterCacheProvider options={{ enableCssLayer: true }}>
            <React.Suspense fallback={<LinearProgress />}>
              <CssBaseline enableColorScheme />
                <NextAppProvider branding={BRANDING} session={session} navigation={NAVIGATION} authentication={AUTHENTICATION}>
                    <Header hideNavigation>
                      {children}
                    </Header>
                </NextAppProvider>
            </React.Suspense>
          </AppRouterCacheProvider>
        </LocationProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
