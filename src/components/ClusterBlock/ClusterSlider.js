import React, { useState, useEffect } from 'react';

const ClusterSlider = ({ clusters, value, onChange }) => {
	const [idx, setIdx] = useState(0);

	useEffect(() => {
		setIdx(value);
	}, [value]);

	const handleChange = (event) => {
		setIdx(Number(event.target.value));
	};

	const handleFinalChange = (event) => {
		setIdx(Number(event.target.value));
		if (typeof onChange !== 'undefined') {
			onChange(idx);
		}
	};

	return (
		<div>
			<input
				type="range"
				min={0}
				max={clusters.length - 1}
				value={idx}
				onChange={(e) => handleChange(e)}
				onMouseUp={(e) => handleFinalChange(e)}
				onKeyUp={(e) => handleFinalChange(e)}
			/>
			<span>{clusters[idx].size}</span>
		</div>
	);
};

export default ClusterSlider;