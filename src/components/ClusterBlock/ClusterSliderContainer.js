import React, { useState, useEffect } from 'react';
import ClusterSlider from './ClusterSlider';

const ClusterSliderContainer = ({ clusters, onChange }) => {
	const [idx, setIdx] = useState(0);

	useEffect(() => {
		setIdx(0);
	}, [clusters]);

	const handleChange = (newIdx) => {
		if (idx !== newIdx) {
			setIdx(newIdx);
			if (typeof onChange !== 'undefined') {
				onChange(clusters[newIdx]);
			}
		}
	};

	if (clusters === null) {
		return <span className="help">Please choose descriptor...</span>;
	}

	return (
		<ClusterSlider
			clusters={clusters}
			value={idx}
			onChange={(newIdx) => handleChange(newIdx)}
		/>
	);
};

export default ClusterSliderContainer;