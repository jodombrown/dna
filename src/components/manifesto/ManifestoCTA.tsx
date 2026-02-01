import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';

export function ManifestoCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' });

  return (
    <motion.div
      ref={ref}
      className="flex justify-center mt-12 md:mt-16"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Link to="/auth">
        <button className="bg-[#4A8D77] text-white text-xl md:text-2xl font-bold px-8 py-4 rounded-lg hover:bg-[#2D5A4A] transition-colors animate-pulse">
          JOIN THE NETWORK
        </button>
      </Link>
    </motion.div>
  );
}

export default ManifestoCTA;
