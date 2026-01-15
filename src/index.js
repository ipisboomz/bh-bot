import { windowManager } from 'node-window-manager';
import screenshot from 'screenshot-desktop';
import Tesseract from 'tesseract.js';
import robot from 'robotjs';
import sharp from 'sharp';
import chalk from 'chalk';

const CHAR_NAME = process.argv[3] || 'Ipis';
const WINDOW_TITLE = process.argv[2] || 'Boomz';

async function getWindow(windowName) {
  // 1. Find window by name
  const windows = windowManager.getWindows();
  const targetWin = windows.find(w => w.getTitle().includes(windowName));

  if (!targetWin) {
    // console.log("Window not found.");
    return;
  }
  targetWin.setBounds({ x: 0, y: 0, height: 1080 + 32 });
  targetWin.bringToTop();
  await wait(500);
  return targetWin;
}

function log(key, text, chalkColor) {
  const color = chalkColor || chalk.reset;
  console.log(`${new Date().toLocaleTimeString()} ${color(key)}: ${text}`);
}

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getInvitesNew(ctx) {
  const { text } = await ctx.getText(1985, 233, 340, 38);
  if (['Ranked', 'Attack', 'Ruins', 'Forest'].find(x => text.includes(x))) {
    ctx.sendClick(2377, 255);
    log('Declined', text, chalk.red);
    await ctx.getText(1860, 166, 472, 108, true);
  }
  if (['Maze', 'Swarm', 'Snow'].find(x => text.includes(x) && text.includes('10'))) {
    ctx.sendClick(2470, 255);
    log('Accepted', text, chalk.green);
    await ctx.getText(1860, 166, 472, 108, true);
  }
}

async function getConnection(ctx) {
  const { text } = await ctx.getText(1080, 520, 400, 85);
  if (text?.includes?.('Connection')) {
    await ctx.sendClick(1270, 905);
    log('Reconnect', text, chalk.red);
  }
  const { text: error } = await ctx.getText(978, 537, 278, 40);
  if (error?.includes?.('Network')) {
    await ctx.sendClick(1520, 905);
    log('Reconnect', error, chalk.red);
  }
}

async function getMaintenanceNotice(ctx) {
  const { text } = await ctx.getText(175, 1018, 130, 35);
  if (text?.includes?.('Connect')) {
    ctx.sendClick(216, 1020);
    log('Attempts to Connect', attText, chalk.red);
  }
}

async function checkIfCanExit(ctx) {
  const { text } = await ctx.getText(1335, 920, 112, 30);
  if (text?.includes?.('Exit')) {
    await ctx.sendClick(1390, 900);
    await wait(500);
    await ctx.sendClick(1520, 900);
    log('Exit 2v2 Room', text, chalk.yellow);
  }
}

async function checkIfCanExitV2(ctx) {
  const { text } = await ctx.getText(930, 930, 112, 30);
  if (text?.includes?.('Exit')) {
    await ctx.sendClick(985, 900);
    await wait(500);
    await ctx.sendClick(1520, 900);
    log('Exit 4vE Room', text, chalk.yellow);
  }
}

async function getCurrentRoom(ctx, prevRoom, roomTime = 0) {
  let time = 0
  const blackList = ['Ranked', 'Guild'];
  const whiteList = ['Bug', 'Mine', 'Snow', 'Forest', 'Ruins'];
  const { text } = await ctx.getText(2008, 852, 235, 35);
  if (blackList.find(x => text?.includes?.(x))) {
    // log('Current Room', text, chalk.cyan);
    await checkIfCanExit(ctx);
    await checkIfCanExitV2(ctx);
  }
  if(whiteList.find(x => text?.includes?.(x))) {
    if (text && text?.length > 4 && prevRoom === text) {
      time = roomTime + 1;
      // log(`Stayed in Room ${text} for`, time, chalk.yellow);
    }
    if (time >= 10) {
      log('Stayed in Room for long time', text, chalk.red);
      await ctx.sendClick(1028, 883);
      await wait(500);
      await ctx.sendClick(1520, 900);
      log('Exit 2v2 Room', text, chalk.yellow);
    }
  }
  return { text, time };
}

async function cancelIfMatching(ctx) {
  const { text } = await ctx.getText(1940, 1020, 240, 35);
  if (['Cancel'].find(x => text?.includes?.(x))) {
    await ctx.sendClick(2062, 1040);
    log('Cancelled Matchmaking', text, chalk.yellow);
  }
}

async function checkChestOpen(ctx) {
  const { text } = await ctx.getText(860, 670, 68, 28);
  if (text?.includes?.('h') && text?.includes?.('83')) {
    await ctx.sendClick(860, 670);
    await wait(1000);
    await ctx.sendClick(860, 670);
    log('Chest Collected: ', text, chalk.green);
  }
}

async function checkIfStuck(ctx, prevText, prevTime = 0) {
  const { text } = await ctx.getText(1440, 864, 146, 40);
  let time = 0;
  if (text === CHAR_NAME && text === prevText) {
    time = prevTime + 1;
    if (time > 5) {
      log('Restarting Game due to being stuck', text, chalk.red);
      await ctx.sendClick(266, 14);
      await wait(500);
      await ctx.swipe(1300, 890, 1300, 45);
      await wait(1000);
      await ctx.sendClick(1070, 300);
      time = 0;
    }
  }
  return { text, time }
}

async function main(targetWin, state) {
  let result = { ...state };
  try {
    const bounds = targetWin.getBounds();
    const img = await screenshot({ format: 'png' });
    const baseImg = sharp(img);
    async function getText(x1, y1, width, height, save) {
      const croppedImg = await baseImg.clone()
        .extract({
          left: Math.max(0, bounds.x + x1),
          top: Math.max(0, bounds.y + y1),
          width,
          height,
        })
        .toBuffer();

      const { data: { text } } = await Tesseract.recognize(croppedImg, 'eng');
      if (save) {
        await sharp(croppedImg).toFile(`./tmp/${new Date().toLocaleString().replace(/[:\/, ]/g, '-').replace(/--/g, ' ')}.png`);
      }
      return {
        image: croppedImg,
        text: text?.trim?.() ?? ''
      }
    }

    async function sendClick(x, y) {
      robot.moveMouse(bounds.x + x, bounds.y + y);
      await new Promise(resolve => setTimeout(resolve, 10));
      robot.mouseClick();
    }

    async function swipe(x1, y1, x2, y2, speed = 30) {
        const startX = bounds.x + x1;
        const startY = bounds.y + y1;
        const endX = bounds.x + x2;
        const endY = bounds.y + y2;
        // 1. Move to start and press down
        robot.moveMouse(bounds.x + startX, bounds.y + startY);
        robot.mouseToggle("down", "left");

        // 2. Calculate the distance to travel
        const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        const steps = distance / speed;

        for (let i = 0; i <= steps; i++) {
            // Linear interpolation (Lerp) to find the next point
            const t = i / steps;
            const currX = startX + (endX - startX) * t;
            const currY = startY + (endY - startY) * t;

            robot.moveMouse(currX, currY);
        }

        // 3. Release mouse
        robot.mouseToggle("up", "left");
    }
    const ctx = { getText, sendClick, swipe };

    await cancelIfMatching(ctx);
    const roomResult = await getCurrentRoom(ctx, state.prevRoom, state.roomTime);
    const stuckResult = await checkIfStuck(ctx, state.prevStuck, state.stuckTime);
    result = {
      ...result,
      prevRoom: roomResult?.text,
      roomTime: roomResult?.time,
      prevStuck: stuckResult?.text,
      stuckTime: stuckResult?.time,
    }
    if (result.counter % 5 === 0) {
      await getConnection(ctx);
      await getMaintenanceNotice(ctx);
      await checkChestOpen(ctx);
    }
    await getInvitesNew(ctx);
  } catch (e) {
    console.error("Error in main loop: ", e);
  }
  return {
    ...result,
    counter: state.counter + 1,
  }
}

const targetWin = await getWindow(WINDOW_TITLE);

log('Target Window', WINDOW_TITLE, chalk.cyan);

if (!targetWin) {
  console.error("Target window not found. Exiting.");
  process.exit(1);
}

log('Note!','Keep window on top and active before you afk', chalk.yellow);

let state = {
  counter: 0,
  prevRoom: '',
  roomTime: 0,
  prevStuck: '',
  stuckTime: 0
};

async function loop() {
  try {
    // log('Start');
    state = await main(targetWin, state);
    setTimeout(loop, 2000);
    // log('End');
  } catch (e) {
    log('Total iterations', state.counter);
    console.error("Error in main loop:", e);
  }
}

loop();

