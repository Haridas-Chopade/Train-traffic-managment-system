const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const dashboardRoutes = require("./routes/dashboardRoutes");
const connectDB = require("./config/db");
const alertRoutes = require("./routes/alertRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const predictionRoutes = require("./routes/predictionRoutes");
const trafficControlRoutes = require("./routes/trafficControlRoutes");
const Train = require("./models/Train");

dotenv.config();

const MAPPED_ROUTES = {
  "16606": [
    { lat: 11.8745, lng: 75.3704, name: "Kannur [CAN]" },
    { lat: 12.1026, lng: 75.2012, name: "Payyanur [PAY]" },
    { lat: 12.3117, lng: 75.0934, name: "Kanhangad [KZE]" },
    { lat: 12.4996, lng: 74.9869, name: "Kasaragod [KGQ]" },
    { lat: 12.8626, lng: 74.8436, name: "Mangalore Central [MAQ]" }
  ],
  "16650": [
    { lat: 12.4996, lng: 74.9869, name: "Kasaragod [KGQ]" },
    { lat: 12.5927, lng: 74.9392, name: "Kumbla [KUL]" },
    { lat: 12.7212, lng: 74.8872, name: "Manjeshwar [MJS]" },
    { lat: 12.8055, lng: 74.8617, name: "Ullal [ULL]" },
    { lat: 12.8626, lng: 74.8436, name: "Mangalore Central [MAQ]" }
  ],
  "22610": [
    { lat: 12.4996, lng: 74.9869, name: "Kasaragod [KGQ]" },
    { lat: 12.5927, lng: 74.9392, name: "Kumbla [KUL]" },
    { lat: 12.7212, lng: 74.8872, name: "Manjeshwar [MJS]" },
    { lat: 12.8055, lng: 74.8617, name: "Ullal [ULL]" },
    { lat: 12.8626, lng: 74.8436, name: "Mangalore Central [MAQ]" }
  ],
  "16596": [
    { lat: 12.9784, lng: 77.5684, name: "Bengaluru [SBC]" },
    { lat: 13.0072, lng: 76.1030, name: "Hassan [HAS]" },
    { lat: 12.9431, lng: 75.7876, name: "Sakleshpur [SKLR]" },
    { lat: 12.6781, lng: 75.6025, name: "Subrahmanya Road [SBHR]" },
    { lat: 12.7214, lng: 75.2104, name: "Kabaka Puttur [KBPR]" },
    { lat: 12.8767, lng: 75.0274, name: "Bantawala [BTR]" },
    { lat: 12.8626, lng: 74.8436, name: "Mangalore Central [MAQ]" }
  ],
  "16336": [
    { lat: 13.3409, lng: 74.7421, name: "Udupi [UD]" },
    { lat: 13.0970, lng: 74.7937, name: "Mulki [MULK]" },
    { lat: 13.0116, lng: 74.7981, name: "Surathkal [SL]" },
    { lat: 12.8675, lng: 74.8761, name: "Mangalore Junction [MAJN]" },
    { lat: 12.8626, lng: 74.8436, name: "Mangalore Central [MAQ]" }
  ],
  "12602": [
    { lat: 12.4996, lng: 74.9869, name: "Kasaragod [KGQ]" },
    { lat: 12.5927, lng: 74.9392, name: "Kumbla [KUL]" },
    { lat: 12.7212, lng: 74.8872, name: "Manjeshwar [MJS]" },
    { lat: 12.8055, lng: 74.8617, name: "Ullal [ULL]" },
    { lat: 12.8626, lng: 74.8436, name: "Mangalore Central [MAQ]" }
  ],
  "12619": [
    { lat: 13.3409, lng: 74.7421, name: "Udupi [UD]" },
    { lat: 13.0970, lng: 74.7937, name: "Mulki [MULK]" },
    { lat: 13.0116, lng: 74.7981, name: "Surathkal [SL]" },
    { lat: 12.8675, lng: 74.8761, name: "Mangalore Junction [MAJN]" },
    { lat: 12.8626, lng: 74.8436, name: "Mangalore Central [MAQ]" }
  ],
  "22637": [
    { lat: 12.4996, lng: 74.9869, name: "Kasaragod [KGQ]" },
    { lat: 12.5927, lng: 74.9392, name: "Kumbla [KUL]" },
    { lat: 12.7212, lng: 74.8872, name: "Manjeshwar [MJS]" },
    { lat: 12.8055, lng: 74.8617, name: "Ullal [ULL]" },
    { lat: 12.8626, lng: 74.8436, name: "Mangalore Central [MAQ]" }
  ],
  "16346": [
    { lat: 11.8745, lng: 75.3704, name: "Kannur [CAN]" },
    { lat: 12.1026, lng: 75.2012, name: "Payyanur [PAY]" },
    { lat: 12.3117, lng: 75.0934, name: "Kanhangad [KZE]" },
    { lat: 12.4996, lng: 74.9869, name: "Kasaragod [KGQ]" },
    { lat: 12.8626, lng: 74.8436, name: "Mangalore Central [MAQ]" }
  ],
  "16604": [
    { lat: 11.8745, lng: 75.3704, name: "Kannur [CAN]" },
    { lat: 12.1026, lng: 75.2012, name: "Payyanur [PAY]" },
    { lat: 12.3117, lng: 75.0934, name: "Kanhangad [KZE]" },
    { lat: 12.4996, lng: 74.9869, name: "Kasaragod [KGQ]" },
    { lat: 12.8626, lng: 74.8436, name: "Mangalore Central [MAQ]" }
  ],
  "16629": [
    { lat: 11.8745, lng: 75.3704, name: "Kannur [CAN]" },
    { lat: 12.1026, lng: 75.2012, name: "Payyanur [PAY]" },
    { lat: 12.3117, lng: 75.0934, name: "Kanhangad [KZE]" },
    { lat: 12.4996, lng: 74.9869, name: "Kasaragod [KGQ]" },
    { lat: 12.8626, lng: 74.8436, name: "Mangalore Central [MAQ]" }
  ],
  "16512": [
    { lat: 12.9784, lng: 77.5684, name: "Bengaluru [SBC]" },
    { lat: 13.0072, lng: 76.1030, name: "Hassan [HAS]" },
    { lat: 12.9431, lng: 75.7876, name: "Sakleshpur [SKLR]" },
    { lat: 12.6781, lng: 75.6025, name: "Subrahmanya Road [SBHR]" },
    { lat: 12.7214, lng: 75.2104, name: "Kabaka Puttur [KBPR]" },
    { lat: 12.8767, lng: 75.0274, name: "Bantawala [BTR]" },
    { lat: 12.8626, lng: 74.8436, name: "Mangalore Central [MAQ]" }
  ]
};

const liveCache = {};
global.lastClientRequestTime = Date.now();

// Connect DB and seed initial trains if collection is empty
connectDB().then(() => {
  seedTrains().then(() => {
    setTimeout(syncLiveTrains, 5000);
  });
});

const trainRoutes = require("./routes/trainRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Track client activity to pause background API calls when idle
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    global.lastClientRequestTime = Date.now();
  }
  next();
});

app.use("/api/trains", trainRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/traffic-control", trafficControlRoutes);

app.get("/", (req, res) => {
  res.send("Train Traffic Backend Running");
});

// TEST RAILRADAR API with fallback to simulated DB train
app.get("/test-train", async (req, res) => {
  const trainNo = req.query.trainNo || "12619";
  
  // Cache check (2 minutes)
  const now = Date.now();
  if (liveCache[trainNo] && (now - liveCache[trainNo].timestamp < 120000)) {
    console.log(`Serving cached live data for train ${trainNo}`);
    return res.json(liveCache[trainNo].data);
  }

  try {
    const liveData = await fetchRailRadar(`/trains/${trainNo}/live`);
    if (liveData) {
      const responseData = {
        success: true,
        data: {
          train_name: liveData.trainName,
          train_number: liveData.trainNumber,
          current_station_name: liveData.currentLocation ? liveData.currentLocation.stationCode : "N/A",
          delay: liveData.delayMinutes || 0,
          eta: liveData.expectedArrivalTime || "12:00",
          cur_stn_lat: liveData.currentLocation ? liveData.currentLocation.lat : 0,
          cur_stn_lng: liveData.currentLocation ? liveData.currentLocation.lng : 0,
          status: liveData.status,
          current_station_code: liveData.currentLocation ? liveData.currentLocation.stationCode : "N/A",
          platform_number: liveData.currentLocation ? liveData.currentLocation.platform : "1",
          update_time: new Date().toLocaleTimeString(),
          route: liveData.route || []
        }
      };

      // Store in cache
      liveCache[trainNo] = {
        timestamp: now,
        data: responseData
      };

      res.json(responseData);
    } else {
      throw new Error(`RailRadar live data returned empty for train ${trainNo}`);
    }
  } catch (err) {
    console.log(`RailRadar failed, falling back to database simulation train ${trainNo}. Error:`, err.message);
    try {
      const train = await Train.findOne({ trainNo: trainNo });
      if (train) {
        res.json({
          success: true,
          data: {
            train_name: train.name,
            train_number: train.trainNo,
            current_station_name: train.route[train.routeIndex]?.name || "Mangalore Central",
            delay: train.delay,
            eta: train.arrival,
            cur_stn_lat: train.currentLat,
            cur_stn_lng: train.currentLng,
            status: train.status,
            current_station_code: "MAQ",
            platform_number: train.platform,
            update_time: new Date().toLocaleTimeString(),
            route: train.route
          }
        });
      } else {
        throw new Error(`Train ${trainNo} not found in database for fallback`);
      }
    } catch (dbErr) {
      res.status(500).json({ error: dbErr.message });
    }
  }
});

// RailRadar API request helper
async function fetchRailRadar(path, params = {}) {
  const url = `${process.env.RAIL_RADAR_BASE_URL || 'https://api.railradar.in/v1'}${path}`;
  const apiKey = process.env.RAIL_RADAR_API_KEY || 'rg_690487a0e6114bcba1e57d5bb6127068';
  try {
    const response = await axios.get(url, {
      params,
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    if (response.data && response.data.success) {
      return response.data.data;
    }
    console.warn(`RailRadar API responded with success=false for path ${path}:`, response.data);
  } catch (err) {
    console.error(`RailRadar API request failed for path ${path}:`, err.message);
  }
  return null;
}

// Telemetry coordinates calculation
function getCoordinatesForLiveTrain(liveData, routeStops) {
  if (!liveData || !liveData.currentLocation || liveData.status === "not-started") {
    if (routeStops && routeStops.length > 0) {
      return { lat: routeStops[0].lat, lng: routeStops[0].lng, routeIndex: 0 };
    }
    return null;
  }
  const curr = liveData.currentLocation;
  const seq = curr.sequence;
  const status = curr.status; // "at-station", "departed", etc.
  
  if (!routeStops || routeStops.length === 0) return null;

  // Find stop by sequence (sequence is 1-indexed)
  let stopA = routeStops.find(s => s.sequence === seq);
  if (!stopA) {
    // Try finding by stationCode
    stopA = routeStops.find(s => s.stationCode === curr.stationCode);
  }
  if (!stopA) {
    // Fallback to first stop
    stopA = routeStops[0];
  }
  
  if (status === "at-station") {
    return { lat: stopA.lat, lng: stopA.lng, routeIndex: routeStops.indexOf(stopA) };
  } else if (status === "departed") {
    // Find next stop in sequence
    const stopB = routeStops.find(s => s.sequence === seq + 1) || routeStops[routeStops.indexOf(stopA) + 1];
    if (stopB && stopA.lat && stopA.lng && stopB.lat && stopB.lng) {
      const progress = curr.segmentProgress || 0.5;
      const lat = stopA.lat + (stopB.lat - stopA.lat) * progress;
      const lng = stopA.lng + (stopB.lng - stopA.lng) * progress;
      return { lat, lng, routeIndex: routeStops.indexOf(stopA) };
    }
    return { lat: stopA.lat, lng: stopA.lng, routeIndex: routeStops.indexOf(stopA) };
  }
  
  return { lat: stopA.lat, lng: stopA.lng, routeIndex: routeStops.indexOf(stopA) };
}

// Sleep helper to avoid API rate limits (429)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Seed trains dynamically from live RailRadar API
async function seedTrainsFromAPI() {
  try {
    console.log("Wiping database and attempting to seed active trains from RailRadar API for MAQ...");
    
    const liveBoard = await fetchRailRadar('/stations/MAQ/live');
    if (!liveBoard || !liveBoard.trains || liveBoard.trains.length === 0) {
      console.warn("Failed to fetch live board for MAQ from RailRadar. Database remains empty.");
      await Train.deleteMany({});
    } else {
      // Clear database to seed with real live trains
      await Train.deleteMany({});
      
      console.log(`Found ${liveBoard.trains.length} trains on MAQ live board. Syncing details...`);
      
      for (const item of liveBoard.trains) {
        const trainNo = item.train.number;
        const trainName = item.train.name;
        
        console.log(`Setting up train ${trainName} (${trainNo})...`);
        
        // 1. Get Route Stops (either from pre-mapped routes, or query API with cache/fallback)
        let routeStops = [];
        if (MAPPED_ROUTES[trainNo]) {
          console.log(`Loading pre-mapped route for train ${trainNo}`);
          routeStops = MAPPED_ROUTES[trainNo].map((s, index) => ({
            lat: s.lat,
            lng: s.lng,
            name: s.name,
            sequence: index + 1,
            stationCode: s.name.includes('[') ? s.name.split('[')[1].replace(']', '') : ''
          }));
        } else {
          // Stagger API call to stay below the Rate Limit
          await sleep(1500);
          console.log(`Querying route details for train ${trainNo} from RailRadar API...`);
          const routeData = await fetchRailRadar(`/trains/${trainNo}/route`, { stops: true });
          if (routeData && routeData.stops && routeData.stops.length > 0) {
            routeStops = routeData.stops.map(s => ({
              lat: Number(s.lat),
              lng: Number(s.lng),
              name: `${s.name} [${s.code}]`,
              sequence: s.sequence,
              stationCode: s.code
            })).filter(s => !isNaN(s.lat) && !isNaN(s.lng) && s.lat !== 0 && s.lng !== 0);
          }
        }
        
        // Fallback simple route if no route stops found
        if (routeStops.length === 0) {
          console.warn(`No route stops found for train ${trainNo}. Using generic coastal fallback route.`);
          routeStops = [
            { lat: 13.3409, lng: 74.7421, name: "Udupi [UD]", sequence: 1, stationCode: "UD" },
            { lat: 13.0116, lng: 74.7981, name: "Surathkal [SL]", sequence: 2, stationCode: "SL" },
            { lat: 12.8626, lng: 74.8436, name: "Mangalore Central [MAQ]", sequence: 3, stationCode: "MAQ" }
          ];
        }
        
        // 2. Fetch Live Status (either from API, or use the station board live info)
        let liveData = null;
        if (item.live && item.live.type !== "scheduled" && item.live.type !== "not-started") {
          await sleep(1500);
          console.log(`Querying live status for train ${trainNo} from RailRadar API...`);
          liveData = await fetchRailRadar(`/trains/${trainNo}/live`);
        }
        
        const coordsInfo = getCoordinatesForLiveTrain(liveData, routeStops);
        const currentLat = coordsInfo ? coordsInfo.lat : routeStops[0].lat;
        const currentLng = coordsInfo ? coordsInfo.lng : routeStops[0].lng;
        const routeIndex = coordsInfo ? coordsInfo.routeIndex : 0;
        
        const delay = liveData ? Number(liveData.delayMinutes) || 0 : (item.live ? Number(item.live.delayMinutes) || 0 : 0);
        
        // Clean platform format to only allow "1", "2", "3", "4"
        const cleanPlatform = (plat) => {
          let p = String(plat || "1").trim().replace(/[^1-4]/g, '');
          if (!p || !['1', '2', '3', '4'].includes(p)) {
            const num = parseInt(plat, 10);
            if (!isNaN(num)) {
              p = String(((num - 1) % 4) + 1);
            } else {
              p = "1";
            }
          }
          return p;
        };

        const rawPlatform = item.stop.platform || (liveData && liveData.currentLocation ? liveData.currentLocation.platform : "1");
        const platform = cleanPlatform(rawPlatform);
        const scheduledPlatform = cleanPlatform(item.stop.platform || "1");
        
        const arrivalTime = item.stop.arrival || (liveData && liveData.scheduledArrival ? liveData.scheduledArrival.split('T')[1].substring(0,5) : "12:00");
        const departureTime = item.stop.departure || (liveData && liveData.scheduledDeparture ? liveData.scheduledDeparture.split('T')[1].substring(0,5) : "12:15");
        
        let status = "Running";
        if (liveData && liveData.status === "not-started") {
          status = "Running";
        } else if (delay > 0) {
          status = "Delayed";
        }
        
        const newTrain = new Train({
          name: trainName,
          trainNo: trainNo,
          arrival: arrivalTime,
          departure: departureTime,
          status: status,
          speed: liveData && liveData.speed ? Number(liveData.speed) : 75 + Math.floor(Math.random() * 25),
          trafficDensity: 30 + Math.floor(Math.random() * 30),
          delay: delay,
          platform: platform,
          scheduledPlatform: scheduledPlatform,
          currentLat: currentLat,
          currentLng: currentLng,
          routeIndex: routeIndex,
          direction: 1,
          route: routeStops.map(s => ({ lat: s.lat, lng: s.lng, name: s.name }))
        });
        
        await newTrain.save();
        console.log(`Successfully seeded live RailRadar train: ${trainName} (${trainNo})`);
      }
      
      // Make sure we have at least a few trains
      const count = await Train.countDocuments();
      console.log(`Seeded database with ${count} active RailRadar trains.`);
    }
  } catch (error) {
    console.error("RailRadar API seed error:", error.message);
    await Train.deleteMany({});
  }
}

// Global seed function
async function seedTrains() {
  try {
    const count = await Train.countDocuments();
    if (count > 0) {
      console.log(`Database already has ${count} trains. Skipping startup RailRadar seed to conserve API quota.`);
    } else {
      await seedTrainsFromAPI();
    }
    
    // Run initial allocation
    const trains = await Train.find();
    const allocationResult = resolveTrackAllocations(trains);
    global.latestTrackOccupancy = allocationResult.trackOccupancy;
    global.latestDecisionLogs = allocationResult.decisionLogs;
  } catch (error) {
    console.error("Global seed error:", error.message);
  }
}

// Track allocation helper functions
function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(mins) {
  mins = mins % 1440;
  if (mins < 0) mins += 1440;
  const h = Math.floor(mins / 60).toString().padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function resolveTrackAllocations(trains) {
  const sortedTrains = [...trains].map(train => {
    const arrMin = timeToMinutes(train.arrival);
    const depMin = timeToMinutes(train.departure);
    let duration = depMin - arrMin;
    if (duration <= 0) duration = 15; // default buffer
    const expectedArrival = arrMin + (train.delay || 0);
    const expectedDeparture = expectedArrival + duration;
    
    return {
      train,
      originalArrivalMin: arrMin,
      originalDepartureMin: depMin,
      duration,
      expectedArrivalMin: expectedArrival,
      expectedDepartureMin: expectedDeparture,
      scheduledPlatform: train.scheduledPlatform || "1",
      allocatedPlatform: null,
      delay: train.delay || 0
    };
  });

  // Sort by expected arrival
  sortedTrains.sort((a, b) => a.expectedArrivalMin - b.expectedArrivalMin);

  const tracks = ["1", "2", "3", "4"];
  const trackOccupancy = { "1": [], "2": [], "3": [], "4": [] };
  const decisionLogs = [];

  const checkTrackAvailable = (track, start, end) => {
    const intervals = trackOccupancy[track];
    for (const inv of intervals) {
      const buffer = 5; // 5 minute safety buffer
      const invStart = inv.start - buffer;
      const invEnd = inv.end + buffer;
      if (Math.max(start, invStart) < Math.min(end, invEnd)) {
        return false;
      }
    }
    return true;
  };

  for (const item of sortedTrains) {
    const { train, expectedArrivalMin, expectedDepartureMin, scheduledPlatform, delay } = item;
    let assignedPlatform = null;
    let isReallocated = false;
    let actualStart = expectedArrivalMin;
    let actualEnd = expectedDepartureMin;

    // Check if scheduled platform is available
    if (checkTrackAvailable(scheduledPlatform, expectedArrivalMin, expectedDepartureMin)) {
      assignedPlatform = scheduledPlatform;
    } else {
      // Find next available track
      for (const track of tracks) {
        if (checkTrackAvailable(track, expectedArrivalMin, expectedDepartureMin)) {
          assignedPlatform = track;
          isReallocated = true;
          break;
        }
      }
    }

    if (!assignedPlatform) {
      // All tracks occupied, find the one that becomes free earliest
      let bestTrack = "1";
      let earliestFreeTime = Infinity;

      for (const track of tracks) {
        const intervals = trackOccupancy[track];
        if (intervals.length === 0) {
          earliestFreeTime = expectedArrivalMin;
          bestTrack = track;
          break;
        }
        const lastDep = Math.max(...intervals.map(i => i.end));
        if (lastDep < earliestFreeTime) {
          earliestFreeTime = lastDep;
          bestTrack = track;
        }
      }

      assignedPlatform = bestTrack;
      const waitTime = Math.max(0, earliestFreeTime - expectedArrivalMin);
      actualStart = expectedArrivalMin + waitTime;
      actualEnd = actualStart + item.duration;
      isReallocated = true;

      decisionLogs.push({
        time: new Date().toLocaleTimeString(),
        trainNo: train.trainNo,
        trainName: train.name,
        message: `⚠️ CRITICAL: ${train.name} (${train.trainNo}) delayed by ${delay}m. All tracks occupied. Held for ${waitTime}m. Reassigned to Track ${assignedPlatform} (ETA pushed to ${minutesToTime(actualStart)}).`
      });
    } else {
      if (isReallocated) {
        decisionLogs.push({
          time: new Date().toLocaleTimeString(),
          trainNo: train.trainNo,
          trainName: train.name,
          message: `🔄 REALLOCATION: ${train.name} (${train.trainNo}) scheduled for Track ${scheduledPlatform}. Due to ${delay > 0 ? `delay of ${delay}m` : 'track blockage'}, it was dynamically reallocated to Track ${assignedPlatform} (ETA: ${minutesToTime(actualStart)}).`
        });
      } else {
        decisionLogs.push({
          time: new Date().toLocaleTimeString(),
          trainNo: train.trainNo,
          trainName: train.name,
          message: `✅ SCHEDULED: ${train.name} (${train.trainNo}) is using its scheduled Track ${assignedPlatform} (ETA: ${minutesToTime(actualStart)}).`
        });
      }
    }

    trackOccupancy[assignedPlatform].push({
      start: actualStart,
      end: actualEnd,
      trainNo: train.trainNo,
      trainName: train.name,
      arrival: minutesToTime(actualStart),
      departure: minutesToTime(actualEnd)
    });

    item.allocatedPlatform = assignedPlatform;
  }

  return {
    sortedTrains,
    trackOccupancy,
    decisionLogs
  };
}

// Coordinate movement simulator
async function simulateTrainMovement() {
  try {
    const trains = await Train.find();
    
    // Resolve track allocations dynamically based on delays
    const allocationResult = resolveTrackAllocations(trains);
    global.latestTrackOccupancy = allocationResult.trackOccupancy;
    global.latestDecisionLogs = allocationResult.decisionLogs;

    for (let train of trains) {
      // Find its allocated platform
      const allocatedObj = allocationResult.sortedTrains.find(t => t.train.trainNo === train.trainNo);
      if (allocatedObj && train.platform !== allocatedObj.allocatedPlatform) {
        train.platform = allocatedObj.allocatedPlatform;
      }

      if (!train.route || train.route.length === 0) {
        await train.save();
        continue;
      }

      const targetIndex = train.routeIndex;
      const target = train.route[targetIndex];
      if (!target) {
        await train.save();
        continue;
      }

      const dLat = target.lat - train.currentLat;
      const dLng = target.lng - train.currentLng;
      const distance = Math.sqrt(dLat * dLat + dLng * dLng);

      if (distance < 0.005) {
        // Reached waypoint, advance index
        let nextIndex = train.routeIndex + train.direction;
        let nextDirection = train.direction;

        if (nextIndex >= train.route.length) {
          nextDirection = -1;
          nextIndex = train.route.length - 2;
        } else if (nextIndex < 0) {
          nextDirection = 1;
          nextIndex = 1;
        }

        train.routeIndex = nextIndex;
        train.direction = nextDirection;
      } else {
        // Move towards next waypoint
        const step = (train.speed || 80) / 40000;
        train.currentLat += (dLat / distance) * step;
        train.currentLng += (dLng / distance) * step;
      }

      // Slightly fluctuate speed & traffic density to make AI inputs dynamic
      if (Math.random() > 0.8) {
        train.speed = Math.max(30, Math.min(120, train.speed + (Math.random() > 0.5 ? 5 : -5)));
        train.trafficDensity = Math.max(10, Math.min(100, train.trafficDensity + (Math.random() > 0.5 ? 8 : -8)));
      }

      await train.save();
    }
  } catch (error) {
    console.error("Error simulating train movement:", error.message);
  }
}

// Background sync job to update all database trains with real API status
async function syncLiveTrains() {
  const now = Date.now();
  const idleTimeout = 5 * 60 * 1000; // 5 minutes idle timeout
  if (now - (global.lastClientRequestTime || 0) > idleTimeout) {
    console.log("No active clients detected in the last 5 minutes. Skipping background RailRadar sync to conserve API quota.");
    return;
  }

  console.log("Starting real-time RailRadar API sync for monitored trains...");
  try {
    const liveBoard = await fetchRailRadar('/stations/MAQ/live');
    if (liveBoard && liveBoard.trains && liveBoard.trains.length > 0) {
      const trains = await Train.find();
      for (let train of trains) {
        // Find matching train in live board
        const liveItem = liveBoard.trains.find(t => String(t.train.number) === String(train.trainNo));
        if (liveItem) {
          train.delay = Number(liveItem.live.delayMinutes) || 0;
          
          let status = "Running";
          if (liveItem.live.type === "not-started") {
            status = "Running";
          } else if (train.delay > 0) {
            status = "Delayed";
          }
          train.status = status;
          
          // Smoothly update coordinates towards the destination using routeIndex
          // Since the simulation advances it, we don't need to force update coordinates from route unless it is at-station
          if (liveItem.live.type === "at-station") {
            const matchIndex = train.route.findIndex(stop => stop.name.endsWith(`[${liveBoard.station?.code || 'MAQ'}]`));
            if (matchIndex !== -1) {
              train.routeIndex = matchIndex;
              train.currentLat = train.route[matchIndex].lat;
              train.currentLng = train.route[matchIndex].lng;
            }
          }
          
          if (liveItem.stop && liveItem.stop.platform) {
            // Clean platform format
            const cleanPlatform = (plat) => {
              let p = String(plat || "1").trim().replace(/[^1-4]/g, '');
              if (!p || !['1', '2', '3', '4'].includes(p)) {
                const num = parseInt(plat, 10);
                if (!isNaN(num)) {
                  p = String(((num - 1) % 4) + 1);
                } else {
                  p = "1";
                }
              }
              return p;
            };
            train.platform = cleanPlatform(liveItem.stop.platform);
          }
          
          await train.save();
          console.log(`Synced train ${train.trainNo} from station board data.`);
        }
      }
      console.log("Real-time RailRadar API sync completed using station board.");
    } else {
      console.warn("Failed to fetch live board for sync. Sync cycle skipped.");
    }
  } catch (err) {
    console.error("Error running real-time RailRadar API sync:", err.message);
  }
}

// Start the real-time simulation interval (every 3 seconds)
setInterval(simulateTrainMovement, 3000);

// Start the real-time RailRadar sync interval (every 5 minutes to stay under quota)
setInterval(syncLiveTrains, 300000);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});