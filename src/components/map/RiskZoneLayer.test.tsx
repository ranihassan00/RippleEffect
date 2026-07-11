import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RiskZoneLayer } from "@/components/map/RiskZoneLayer";

describe("RiskZoneLayer", () => {
  it("renders the semantic risk zones when visible", () => {
    const { container } = render(<svg><RiskZoneLayer centerX={118} centerY={386} minutes={30} visible /></svg>);

    expect(container.querySelector('g[aria-label="Risk zones"]')).toHaveAttribute("opacity", "1");
    expect(container.querySelectorAll("title")).toHaveLength(5);
  });

  it("keeps the risk geometry hidden when the layer is disabled", () => {
    const { container } = render(<svg><RiskZoneLayer centerX={118} centerY={386} minutes={30} visible={false} /></svg>);

    expect(container.querySelector('g[aria-label="Risk zones"]')).toHaveAttribute("opacity", "0");
  });
});
