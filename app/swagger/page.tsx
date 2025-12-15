"use client";

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';
import { openApiSpec } from '@/lib/swagger-spec';

// Dynamically import SwaggerUI to avoid SSR issues with it
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function SwaggerPage() {
    return (
        <div className="bg-white min-h-screen">
            <SwaggerUI spec={openApiSpec} />
        </div>
    );
}
