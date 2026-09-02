import React from 'react';
import { Star } from 'lucide-react';
import { PageHeader, UnderDevelopment } from '../components/PortalUI';

const PerformanceEvaluation = () => (
    <div>
        <PageHeader title="Performance Evaluation" subtitle="Rate and review the employees reporting to you" icon={Star} />
        <UnderDevelopment />
    </div>
);

export default PerformanceEvaluation;
