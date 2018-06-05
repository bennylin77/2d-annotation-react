const colors = ["rgba(3, 169, 244)", "rgba(244, 67, 54)", "rgba(233, 30, 99)"]
const getRandomInt = max => {
  return Math.floor(Math.random() * Math.floor(max));
}
const interpolationArea = ({ startTraj, endTraj, played, currentTimeOffset=0 }) => {
	let lapseTime = endTraj.time - startTraj.time;
	let curTime = played - currentTimeOffset - startTraj.time;
	let widthSlope = (endTraj.width - startTraj.width)/lapseTime
	let heightSlope = (endTraj.height - startTraj.height)/lapseTime
	let width = widthSlope * curTime + startTraj.width
	let height = heightSlope * curTime + startTraj.height
	return { width: width, height: height}
}


const interpolationPosition = ({ startTraj, endTraj, played, currentTimeOffset=0, startTrajXCorrection = 0, startTrajYCorrection = 0 }) => {
	//console.log(`startTraj.x: ${startTraj.x}`)
	//console.log(`startTraj.y: ${startTraj.y}`)
	let lapseTime = endTraj.time - startTraj.time;
	let curTime = played - currentTimeOffset - startTraj.time;
	let xSlope = (endTraj.x - startTraj.x)/lapseTime;
	let ySlope = (endTraj.y - startTraj.y)/lapseTime;
	let x = xSlope * curTime + startTraj.x + startTrajXCorrection;
	let y = ySlope * curTime + startTraj.y + startTrajYCorrection;
	//console.log(xSlope * curTime)
	//console.log(ySlope * curTime)
	return { x: x, y: y}
}

export {colors, getRandomInt, interpolationArea, interpolationPosition}
