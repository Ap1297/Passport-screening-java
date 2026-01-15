import { render, screen } from "@testing-library/react"
import ScreeningResults from "@/components/screening-results"

describe("ScreeningResults Component", () => {
  const mockData = {
    extractedName: "JOHN DOE",
    confidence: 0.95,
    sanctions: {
      isSanctioned: false,
      entries: [],
    },
    processing_time: 2.456,
    timestamp: "2024-01-12T10:30:00",
  }

  it("renders null gracefully when no data provided", () => {
    const { container } = render(<ScreeningResults data={null} />)
    expect(container.firstChild).toBeNull()
  })

  it("displays extracted name", () => {
    render(<ScreeningResults data={mockData} />)
    expect(screen.getByText("JOHN DOE")).toBeInTheDocument()
  })

  it("displays OCR confidence percentage", () => {
    render(<ScreeningResults data={mockData} />)
    expect(screen.getByText("95.0%")).toBeInTheDocument()
  })

  it("displays no match status when not sanctioned", () => {
    render(<ScreeningResults data={mockData} />)
    expect(screen.getByText("NO MATCH FOUND")).toBeInTheDocument()
    expect(screen.getByText(/does not appear on the UN consolidated sanctions list/i)).toBeInTheDocument()
  })

  it("displays match found status when sanctioned", () => {
    const sanctionedData = {
      ...mockData,
      sanctions: {
        isSanctioned: true,
        entries: [
          {
            name: "JOHN DOE",
            listType: "UN_CONSOLIDATED",
            designation: "Terrorist",
          },
        ],
      },
    }

    render(<ScreeningResults data={sanctionedData} />)
    expect(screen.getByText("MATCH FOUND")).toBeInTheDocument()
    expect(screen.getByText(/appears on one or more sanctions lists/i)).toBeInTheDocument()
  })

  it("displays matching entries when sanctioned", () => {
    const sanctionedData = {
      ...mockData,
      sanctions: {
        isSanctioned: true,
        entries: [
          {
            name: "JOHN DOE",
            listType: "UN_CONSOLIDATED",
            designation: "Terrorist",
          },
        ],
      },
    }

    render(<ScreeningResults data={sanctionedData} />)
    expect(screen.getByText("JOHN DOE")).toBeInTheDocument()
    expect(screen.getByText(/UN_CONSOLIDATED/i)).toBeInTheDocument()
    expect(screen.getByText(/Terrorist/i)).toBeInTheDocument()
  })

  it("displays processing time", () => {
    render(<ScreeningResults data={mockData} />)
    expect(screen.getByText("2.46s")).toBeInTheDocument()
  })

  it("displays system information", () => {
    render(<ScreeningResults data={mockData} />)
    expect(screen.getByText(/System Information/i)).toBeInTheDocument()
    expect(screen.getByText(/UN Consolidated Sanctions List/i)).toBeInTheDocument()
    expect(screen.getByText(/Tesseract OCR/i)).toBeInTheDocument()
  })
})
