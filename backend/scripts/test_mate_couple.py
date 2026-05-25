from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.mate_couple import build_couple_payload


def test_mate_couple_payload_shape() -> None:
    initiator = {
        "id": "a1",
        "user_id": "u1",
        "suite_slug": "s03_mate_female",
        "archetype_gender": "female",
        "ros_index": 72,
        "dimension_scores": {"FS1": 70, "FS2": 75, "FS3": 68, "FS4": 65, "FS5": 35},
        "result_payload": {
            "gender": "female",
            "axisX": 68,
            "axisY": 72,
            "positionType": {"name": "让人想留下来的人"},
            "identityCard": {"title": "让人想留下来的人"},
        },
    }
    partner = {
        "id": "a2",
        "user_id": "u2",
        "suite_slug": "s03_mate_male",
        "archetype_gender": "male",
        "ros_index": 70,
        "dimension_scores": {"MS1": 72, "MS2": 68, "MS3": 74, "MS4": 66, "MS5": 40},
        "result_payload": {
            "gender": "male",
            "axisX": 65,
            "axisY": 70,
            "positionType": {"name": "让人想留下来的人"},
            "identityCard": {"title": "让人想留下来的人"},
        },
    }
    payload = build_couple_payload(code="ROS-TEST-0001", initiator=initiator, partner=partner)
    assert payload["model"] == "MATE_PAIR_V1"
    assert payload["relationship_summary"]["matching_score"] >= 45
    assert payload["relationship_analysis"]["P1"]["level"]
    assert payload["risk_lab"]["risk_name"]
    assert payload["matchmaker_advice"]["oneChange"]


if __name__ == "__main__":
    test_mate_couple_payload_shape()
    print("mate couple tests passed")
