export type PortfolioVideo = { id: string; name: string };
export type PortfolioOffer = {
  slug: string;
  name: string;
  market: 'BR' | 'MX';
  folderId: string;
  videos: PortfolioVideo[];
};

const video = (entries: [string, string][]): PortfolioVideo[] =>
  entries.map(([id, name]) => ({ id, name }));

export const portfolioOffers: PortfolioOffer[] = [
  {
    slug: 'bolis-gourmet-mx', name: 'Bolis Gourmet', market: 'MX', folderId: '1J7oPUhWwSwiobfdKqVAe_unTPr8wyIhN',
    videos: video([
      ['1Z8ysYBY-zwWkdAvgxdWZJpmp_bLFbaFy','ctv_copy4.mp4'],
      ['15scTnUQs3f-N4N0kv0mQXqGzUeaawp25','ctv_copy5.mp4'],
      ['1nBEtmtFkhB3fXnPQMm3-H4Iah55Q5bux','ctv_copy6_react.mp4'],
      ['1mXD27twMUJZjZd1TQHjQCstafb9owcti','ctv_copy7_react.mp4'],
      ['1UL6LeNscanA_S6k-Ji1XrQD7o6ULn9nN','ctv_copy9_broll.mp4'],
      ['1ZBGtKiMJv_TzWOcMlrxfvP18Zx7V31gF','ctv_copy10_broll.mp4'],
      ['1C51SOuOOD6u1KBPd7XB4qiWBvmbtVwuP','ctv_copy11_broll.mp4'],
      ['1F9VS6ar1-_3AT4qVby9_x3KsJD_Rzx0h','ctv1_1.mp4'],
      ['1QyiA0ahJr4w8boABbJtt-QJ018GHFoLK','ctv2_2.mp4'],
      ['11HpkEPOliX_kEbvLAqt2cMx-070IsMJQ','ctv3_1.mp4'],
      ['17RiW4e_BFRP_JaMDg6FUtuGQi8-bQuRZ','ctv4_1.mp4'],
      ['1MAW_H7ilYD0-0zBKLyWi549XXaorkcky','ctv4_2.mp4'],
      ['1YY0GbLuHNdHfFjOby2qZ7ZbUPf-MCgHP','ctv8_variacao1.mp4'],
      ['1KbuwVL2KvF0LLo2bz2QTgEoj2cGaGzRq','ctv8_variacao2.mp4'],
      ['1jxuhxAl6No3M1GRhXV3vsTgh09BZFMeC','ctv8_variacao3.mp4'],
      ['1mUypcqZrdIYE4QAti8rQ_em87tR7fAKJ','ctv8_variacao4.mp4'],
      ['16DjKNDb8IU9PX8skHgVZmatbKb0XlU18','ctv8_variacao5.mp4'],
      ['1g2WrW6zQPALlMaDk6by3voiss8eL1f_O','ctv11.mp4'],
      ['1jGeZ1_nyNH-NadCwX9fGrEwrJ6-mYYFk','ctv12.mp4'],
      ['1U3E_AggQoB1y4S1mvQgnPC0mxYQKIdjP','ctv21.mp4'],
      ['1f5UPgAVITmuSHhyVKuGzppVP3_ul7XWH','ctv22.mp4'],
      ['15DFsKRFOGTbrMlgoWeFqHao6wCyD51BY','ctv23.mp4'],
      ['1BSqHMSfxvbV3n_vjmPV_uGqKE8q2P1li','ctv24.mp4'],
      ['1DOR0JaJb891ngrUvnd9YVe782ipAd9Ti','ctv25.mp4'],
      ['10RVTlq532u5oPA9fqv56q2aE_URdpCBZ','ctv31.mp4'],
      ['1Yhkm0AZC647VWT4dLEpG32P3wQU4FOCJ','ctv32.mp4'],
      ['1DqxsmFKqX0qmFes8Giaek_YVBMB4Tpic','ctv33.mp4'],
      ['16vxOJ5352kyDq89xnl3jpStalYXzGrLR','ctv43.mp4'],
      ['1OEAwk0xrI84477sYNJ_bHotHBvwvCVYA','ctv44.mp4'],
      ['1oZp_Hp6y8-dh-93FmZPz047Foboyi6l9','ctv45.mp4'],
      ['12TEqkVCMJlh5rvojeVNc38jEKDww2Ycr','ctv54.mp4'],
      ['1MmptXqv2FTnCsSlJc8D7glik6pZOOpqC','ctv55.mp4'],
      ['1jhzmyECk1084Ek3mA9mMoBm9VhaZ98AN','ctv56.mp4'],
      ['17dMGFNHOwe66wk6_fNOjwJnr26jmiXio','g_ctv1.mp4'],
      ['1chFjJSp-1zcnu9mwoJjmEZ98PdSjBFv8','g_ctv2.mp4'],
      ['1nFwydLBXnryrxmc_I9YZsKGN5wozkGcH','g_ctv3.mp4'],
      ['1wpLz3zjkRupIOQUk4ImmC4o1hUy5nw7S','g_ctv4.mp4'],
    ]),
  },
  {
    slug: 'doces-cravejados-br', name: 'Doces Cravejados', market: 'BR', folderId: '11Z6axGf_R73eROMkOc2j13jMYrdneLSM',
    videos: video([
      ['1EK9ZFDDpEQ6VcBiH2tZdN1bn2EPNx3Zq','ctv_copy3.mp4'],
      ['17da33sZO_LVHK0LO86IpdsjjFW4y_sgf','ctv_podcast_cravejados.mp4'],
      ['13R7XCeCdEL-DeOmi1oHStRNecMrSBUBH','ctv_react_copy1.mp4'],
      ['1TmxJkf-eL1hdvIsgf2wIGkrmJorRLdum','ctv_react_copy2.mp4'],
      ['1KKIX-c5QZH4DfM7XpB8TpZGOjTfQMLOj','ctv_react_cravejados.mp4'],
      ['1gwOrWsROfb9xBjGpE8oGdXEGWVemoFHk','ctv_ugc_cravejados.mp4'],
      ['1D9YzrHWDElEsIWExxj34GIJDYTmUR4lP','ctv1_broll.mp4'],
      ['1V3Ek105BUrO_hojM3lWOU0l8j42-Izne','ctv1_validado_v1.mp4'],
      ['1jxqSTL5D5r83qR_w-1VJeNlrbX6dc7cn','ctv1_validado_v2.mp4'],
      ['1-Pt-ueiFuUFYXXhUKPeFvEAmmJcMOPXE','ctv1_validado_v3.mp4'],
      ['1IlO1aLQ6iqhQC8yeEaROv2I9yfDoIw_2','ctv2_broll.mp4'],
      ['1qMHAS_6xElxCC-1xZ_pyYi9Wne031nx1','ctv3_broll.mp4'],
      ['1rJSIiqeEAEDAl93z3uw-RdBHC-hM6LRI','ctv4_broll.mp4'],
      ['1l7hV_wubgdbiAW4tnLOWEd7QKpFPRJ0c','ctv5_broll.mp4'],
    ]),
  },
  {
    slug: 'paletas-mx', name: 'Paletas', market: 'MX', folderId: '1gE47IAfXawxvNrv57ARnaK5br82QWR3F',
    videos: video([
      ['1J_x0rXUvErUbIlsSoz9FS1zdJTV8YJWo','ctv_paleta_broll_copy1.mp4'],
      ['1wHtxiEFRNfgaInypqF2W9G_ODO5Xzld5','ctv_paleta_broll_copy2.mp4'],
      ['1QX1aridS2xk3-t4cGFGSCUgkPQ_7G99d','ctv_paleta_broll_copy3.mp4'],
      ['1lFn3UkGQ4emNqGLyQbSfhe2u5U4_gDC2','ctv_podcast_paletas.mp4'],
      ['1OgqHG6ertkQU7__pjWFw4GU0yNkXwqNE','ctv_react_paletas.mp4'],
      ['1HVt9K5yQVA4C6e97T6aN6MojLoyq0Hby','ctv_ugc_paletas.mp4'],
    ]),
  },
  {
    slug: 'papo-cheio-br', name: 'Papo Cheio', market: 'BR', folderId: '16wYhE8A33pzdktdrxAM3_FX_qZg9SEkV',
    videos: video([
      ['1oBV-vDXKnBgXeKd--tr_SHgS8vTP9TgQ','ctv1_papocheio_ugc.mp4'],
      ['14co2HNnY1NsEYKqKyTSRxLIq3UElu0_o','ctv1_PC10PBL_ugc.mp4'],
      ['1ZFrbxk47F6sV7VLbdpPXjdhVGF4F4OfA','ctv2_papocheio_ugc.mp4'],
      ['1G4LcIM4Unt7uLifP386aRpkftWkCFcUG','ctv2_PC11PBL_ugc.mp4'],
      ['1gjMtOHQbNwivi2YBVk9DE8ROVKpWmwXF','ctv3_papocheio_react.mp4'],
      ['1K6FIWr7c5otYMh0-GTQLcE95Kn69spxh','ctv3_PC12PBL_ugc.mp4'],
      ['1fu_mbEAFPrzjjJtB5vqUgcI8xYx1HNQy','ctv4_papocheio_ugc.mp4'],
      ['1OiAn54eu8cX62S84uvoztfNKs1Dz6YD9','ctv5_papocheio_broll.mp4'],
    ]),
  },
  {
    slug: 'posavasos-de-crochet-mx', name: 'Posavasos de Crochet', market: 'MX', folderId: '1-aLoqWQSC6fBuT2Hyf5tPCjSq4H9CYUt',
    videos: video([
      ['1EnIH7dcFpYCKfN-IWaemQePXfurN7svE','ctv_c1_crochet.mp4'],
      ['1GpE17SFm-pdldAssnLDS5yXDGvbuknFR','ctv_c3_crochet.mp4'],
      ['1NMdtOHovvWTfThF1qUJLPcRbfY7HCJo-','ctv_c4_crochet.mp4'],
      ['1PZk7W-M_lFv2zne1oXqON7s1eSF7Qwne','ctv_copy1.mp4'],
      ['1slSWEro-IvUm5azdjIurhbNIYceacJxJ','ctv_copy2.mp4'],
      ['1xQmg57qJBU0oARL8lIKHXLR5ZeoDbC9I','ctv_copy3.mp4'],
      ['1mG7eXhQKEdHCSpgEQkBF2h0SvMoeNhEj','ctv_copy4.mp4'],
      ['1vpJU6xzvNXW_EelRLXBXLC8J0HIcs1iG','ctv_copy5.mp4'],
      ['1pO30Efmk8ncQy9whngTGGQuSSkG0s8j7','ctv74_novelinha.mp4'],
      ['1g9GXpfPNjusDr-E0HGDYgoS_rAruTVti','ctv75_aguja.mp4'],
    ]),
  },
  {
    slug: 'postres-sin-horno-mx', name: 'Postres sin horno', market: 'MX', folderId: '1VHEzPgvXs1cAouaDHNl9Rjf-lTWZEGhI',
    videos: video([
      ['16UKbfBQ6l5dgEwv3cNPg6HbFETzGypm6','ctv_copy1_bolo.mp4'],
      ['1X5awpUNGk_nq9PsIO3O6LRdT8Iunhl12','ctv_copy2_bolo.mp4'],
      ['1eujJ31VpzMPaWYLyzdceKLPV6HrifjaM','ctv_copy3_bolo.mp4'],
    ]),
  },
  {
    slug: 'recetas-para-hijo-mx', name: 'Recetas para Hijo', market: 'MX', folderId: '18gsAtR02pQPurg21K9hCTrSo0KlJ3LC1',
    videos: video([
      ['1zoEgKYu05Ngmyx7kJ-507DrcPlmWEJ38','ctv_bbt1_main.mp4'],
      ['1befvD7-Hnb3mYySEQ3FWjtBtMDPzXVd8','ctv_bbt2.mp4'],
      ['1uhAdVtL-gZFHEMGocbOvoBQCC80o8_KD','ctv_bbt3.mp4'],
      ['1yLmDDk4zR_F_Stf9EJ657LFoTBUi-TOS','ctv1_main_audioigual.mp4'],
      ['1UVsbUa7PF_frZek23O8k8XRAjKHS3yut','ctv1_mesmacopy.mp4'],
      ['1Xd6TSow7AN6RRNyRAOnK-8KB8McUkaxH','ctv1_variacao1.mp4'],
      ['1RD3ekpovG7FOZQ0b7yUgOwkqQYvGvVvr','ctv1_variacao2.mp4'],
      ['1JjIj9vllg9HGUqTUK7a_h_4sFPrr8n2C','ctv2_audioigual.mp4'],
      ['1h2q1laD9eTYXk4jpuORq57JG26AasOc6','ctv3_audioigual.mp4'],
    ]),
  },
];
