import { useState } from 'react';
import styles from './RangeSlider/styles.module.css';

const DualRangeSlider = ({ minValue, maxValue }) => {
	const [sliderOneVal, setSliderOneVal] = useState(minValue);
	const [sliderTwoVal, setSliderTwoVal] = useState(maxValue);

	const minGap = 1;
	const _fnSliderOneHandler = (val1) => {
		if (Number(val1) <= sliderTwoVal - minGap) {
			setSliderOneVal(Number(val1));
		}
	};
	const _fnSliderTwoHandler = (val2) => {
		console.log(val2 >= sliderOneVal + minGap);
		if (Number(val2) >= sliderOneVal + minGap) {
			setSliderTwoVal(Number(val2));
		}
	};
	return (
		<div className="h-full space-y-4">
			<div className="flex justify-between">
				<input
					className="py-1 pr-2 pl-5 text-center rounded-full focus:ring-black focus:border-black"
					type="number"
					id="fromInput"
					value={sliderOneVal}
					min={minValue}
					max={maxValue}
					onChange={(e) => {
						_fnSliderOneHandler(e.target.value);
					}}
				/>
				<div className="flex-1 self-center px-2">
					<div className="bg-black h-px"></div>
				</div>
				<input
					className="py-1 pr-2 pl-5 text-center rounded-full focus:ring-black focus:border-black"
					type="number"
					id="toInput"
					value={sliderTwoVal}
					min={minValue}
					max={maxValue}
					onChange={(e) => {
						_fnSliderTwoHandler(e.target.value);
					}}
				/>
			</div>
			<div className={styles.range__wrapper}>
				<div className={styles.container__cls}>
					<div className={styles.slider__tracker}></div>
					<input
						type="range"
						id="slider-1"
						min={minValue}
						max={maxValue}
						value={sliderOneVal}
						onChange={(e) => {
							_fnSliderOneHandler(e.target.value);
						}}
					/>
					<input
						type="range"
						id="slider-2"
						min={minValue}
						max={maxValue}
						value={sliderTwoVal}
						onChange={(e) => {
							_fnSliderTwoHandler(e.target.value);
						}}
					/>
				</div>
			</div>
		</div>
	);
};

export default DualRangeSlider;
