import React from 'react';

// Simplified visual representation for now. In real app, this would use Canvas/WebGL.
const NewsCloud = ({ impactScore }: { impactScore: number }) => {
    const size = Math.abs(impactScore) * 10 + 50; // Dynamic size
    const color = impactScore > 0 ? 'bg-green-500' : 'bg-red-500';

    return (
        <div
            className={`rounded-full ${color} opacity-60 blur-xl animate-pulse absolute`}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                filter: 'blur(40px)',
            }}
        />
    );
};

export default NewsCloud;
