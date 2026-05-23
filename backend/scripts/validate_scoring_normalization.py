from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.scoring import summarize_scores


def main() -> None:
    rows = [
        {
            "external_question_id": "q1",
            "dimension_code": "intimacy",
            "question_type": "scale",
            "question_payload": {},
            "scoring_payload": {},
            "weight": 2.5,
        },
        {
            "external_question_id": "q2",
            "dimension_code": "intimacy",
            "question_type": "scale",
            "question_payload": {},
            "scoring_payload": {},
            "weight": 1.0,
        },
        {
            "external_question_id": "q3",
            "dimension_code": "stability",
            "question_type": "scale",
            "question_payload": {},
            "scoring_payload": {},
            "weight": 3.0,
        },
    ]
    answers = {
        "q1": {"value": 5},
        "q2": {"value": 1},
        "q3": {"value": 5},
    }
    scores = summarize_scores(rows, answers)
    assert scores["dimension_scores"]["intimacy"] == 77.14, scores
    assert scores["dimension_scores"]["stability"] == 100, scores
    assert 0 <= scores["ros_index"] <= 100, scores
    print("scoring normalization ok", scores)


if __name__ == "__main__":
    main()
