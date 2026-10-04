/**
 * Official / manufacturer frequency response specs for mic ASINs
 * (used when Amazon table lacks Frequency Range)
 * Values: { lowHz, highHz }
 */
export const MIC_FREQUENCY_KNOWN = {
  B00006I5R7: { lowHz: 40, highHz: 16000 }, // Sennheiser e 835
  B0002BACB4: { lowHz: 50, highHz: 16000 }, // Shure Beta 58A (official; Amazon lists 20-16k)
  B0002ERG6K: { lowHz: 50, highHz: 18000 }, // audio-technica AT-X3
  B0002KZAKS: { lowHz: 50, highHz: 15000 }, // Behringer XM8500
  B000BQ79W0: { lowHz: 100, highHz: 16000 }, // AT875R shotgun
  B000N94SJC: { lowHz: 40, highHz: 16000 }, // Sennheiser e 845-S
  B000R8KFUU: { lowHz: 50, highHz: 15000 }, // KC CM-2000
  B000SAGSRQ: { lowHz: 100, highHz: 15000 }, // Superlux D112/C
  B0014THK5E: { lowHz: 20, highHz: 20000 }, // AT9901
  B001TOYV4M: { lowHz: 50, highHz: 18000 }, // AT PRO35
  B002T45X1G: { lowHz: 20, highHz: 20000 }, // AT2035
  B004KVIZFM: { lowHz: 100, highHz: 15000 }, // Sony ECM-TL3
  B005M2HDA6: { lowHz: 100, highHz: 10000 }, // Sony ECM-PCV80U
  B009GY4E2G: { lowHz: 100, highHz: 10000 }, // UNI-PEX MD-5A
  B00BLDTKBK: { lowHz: 50, highHz: 15000 }, // Superlux PROH7F
  B00TTQM94Q: { lowHz: 70, highHz: 15000 }, // Shure PGA58
  B013SYV6P2: { lowHz: 80, highHz: 20000 }, // Sanwa MM-MCU01BK
  B01GJ9IUNY: { lowHz: 20, highHz: 20000 }, // Marantz MPM-2000U
  B01ISNU3X4: { lowHz: 50, highHz: 16000 }, // TONOR dynamic karaoke
  B075PJ7V3V: { lowHz: 20, highHz: 20000 }, // FIFINE K669B
  B078Z79SZJ: { lowHz: 80, highHz: 12500 }, // Samson Q6
  B07GCHX2YS: { lowHz: 100, highHz: 18000 }, // Sennheiser XS 1
  B07GLWQS61: { lowHz: 20, highHz: 20000 }, // Maono USB condenser set
  B0822PSXCN: { lowHz: 40, highHz: 18000 }, // Blue Snowball iCE
  B082LZKNF3: { lowHz: 50, highHz: 15000 }, // Behringer XM8500 listing
  B083NC4ZTT: { lowHz: 50, highHz: 16000 }, // Mackie EM-89D
  B08G8WH435: { lowHz: 20, highHz: 20000 }, // HyperX QuadCast S
  B08KY7G1GV: { lowHz: 50, highHz: 16000 }, // Shure MV7
  B08V8S2NJQ: { lowHz: 70, highHz: 20000 }, // AKG D5
  B09BFPNW2J: { lowHz: 40, highHz: 16000 }, // AT2040 dynamic
  B09W5MWL9Z: { lowHz: 40, highHz: 19000 }, // sE V7
  B09XDH2P6P: { lowHz: 20, highHz: 20000 }, // HyperX QuadCast S white
  B09XQVB4XC: { lowHz: 20, highHz: 20000 }, // HyperX SoloCast white
  B0BTPYCD86: { lowHz: 20, highHz: 20000 }, // Sennheiser Profile USB
  B0C6LPX3T4: { lowHz: 40, highHz: 16000 }, // AT2040USB
  B0FLKJ7FH7: { lowHz: 20, highHz: 20000 }, // HyperX SoloCast 2
  B0000AQ6SC: { lowHz: 50, highHz: 15000 }, // Shure SM58
  B0002E4Z8L: { lowHz: 40, highHz: 15000 }, // Shure SM57
  B000NAXCC0: { lowHz: 40, highHz: 18000 }, // Sennheiser e 945
  B0002E4Z8M: { lowHz: 50, highHz: 20000 }, // Shure SM7B
  B0006H92QK: { lowHz: 20, highHz: 20000 }, // AT2020
  B0002D0BQ8: { lowHz: 20, highHz: 20000 }, // AT4040
  B0822PMBTZ: { lowHz: 20, highHz: 20000 }, // Blue Yeti
  B0B823S1NR: { lowHz: 20, highHz: 20000 }, // AT2020USB-X
  B000CZ0R42: { lowHz: 20, highHz: 20000 }, // AT2020USB+
  B093LFS9QF: { lowHz: 20, highHz: 20000 }, // Tascam TM-250U
  B08G7T3Q9S: { lowHz: 20, highHz: 20000 }, // Shure MV88+
  B0CCVBQRFX: { lowHz: 20, highHz: 20000 }, // TONOR TD510+
  B09VGCZHG4: { lowHz: 20, highHz: 20000 }, // JBL Quantum Stream
  B0C6LMXRTM: { lowHz: 40, highHz: 16000 }, // AT2040USB bundle
  B092JB6XR3: { lowHz: 20, highHz: 20000 }, // ZealSound USB condenser
  B0GQRSQ86L: { lowHz: 80, highHz: 20000 }, // Elgato Wave:3
  B0DXW278KB: { lowHz: 20, highHz: 20000 }, // HyperX QuadCast 2
  B0CRV2C7HD: { lowHz: 70, highHz: 20000 }, // Logitech Yeti Orb
  B0G8XDVZH8: { lowHz: 20, highHz: 20000 }, // AT2020 CWH set
  B08P411XR5: { lowHz: 35, highHz: 20000 }, // ZOOM Am7
  B0CL9BTQRF: { lowHz: 30, highHz: 20000 }, // Amazon Basics USB condenser
  B0FG7DVV62: { lowHz: 20, highHz: 20000 }, // UGREEN CM564 USB condenser
  B0GMFVHXZT: { lowHz: 50, highHz: 18000 }, // LEWITT MTP 5
  B0GQGP99Y7: { lowHz: 100, highHz: 10000 }, // TOA DM-1200
  B0FGX7M31M: { lowHz: 50, highHz: 15000 }, // Talomen L52
  B09N955HJJ: { lowHz: 50, highHz: 20000 }, // Shure Nexadyne 8/C
  B09H2KJWL1: { lowHz: 40, highHz: 16000 }, // AT2040 bundle
  B0FH27SYTK: { lowHz: 50, highHz: 16000 }, // Shure Beta 58A bundle
  B0FHPWTPW8: { lowHz: 40, highHz: 16000 }, // AT2040USB bundle
  B0DZ5HLQC7: { lowHz: 100, highHz: 15000 }, // Sanwa 400-SP045 dynamic
  B0GJP76J2M: { lowHz: 20, highHz: 20000 }, // TONOR TD510 AIR S
  B078Z79SZJ: { lowHz: 80, highHz: 12500 }, // Samson Q6
  B005M2HDA6: { lowHz: 100, highHz: 10000 }, // Sony ECM-PCV80U
}
