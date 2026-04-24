import azure_mainBg from "@/Assets/azure_main.jpg";
import goddess_of_death_templeBg from "@/Assets/goddess_of_death_temple.jpg";
import freed_nightmareBg from "@/Assets/freed_nightmare.jpg";
import star_turtle_grand_libraryBg from "@/Assets/star_turtle_grand_library.jpg";
import heretics_castleBg from "@/Assets/heretics_castle.jpg";
import venus_goddess_of_beautyBg from "@/Assets/venus_goddess_of_beauty.jpg";
import nabelBg from "@/Assets/nabel.jpg";
import inaeBg from "@/Assets/inae.jpg";
import diregieBg from "@/Assets/diregie.jpg";
import apocalypseBg from "@/Assets/apocalypse.jpg";

/**
 * content별 배경 이미지 (CONTENT_IDS key와 동일한 이름의 Assets 파일)
 */
export const CONTENT_BG_IMAGES = {
    azure_main: azure_mainBg,
    goddess_of_death_temple: goddess_of_death_templeBg,
    freed_nightmare: freed_nightmareBg,
    star_turtle_grand_library: star_turtle_grand_libraryBg,
    heretics_castle: heretics_castleBg,
    venus_goddess_of_beauty: venus_goddess_of_beautyBg,
    apocalypse: apocalypseBg,
    nabel: nabelBg,
    inae: inaeBg,
    diregie: diregieBg,
};

/**
 * content 페이지 path variable
 * key: 경로에 사용 (예: /content/azure_main)
 * value: 화면에 표시되는 텍스트
 */
export const CONTENT_IDS = {
    azure_main: "애쥬어 메인",
    goddess_of_death_temple: "죽음의 여신전",
    freed_nightmare: "해방된 흉몽",
    star_turtle_grand_library: "별거북 대서고",
    heretics_castle: "배교자의 성",
    venus_goddess_of_beauty: "미의 여신 베누스",
    apocalypse: "아포칼립스",
    nabel: "만들어진 신, 나벨",
    inae: "이내 황혼전",
    diregie: "검은 역병의 디레지에",
};
